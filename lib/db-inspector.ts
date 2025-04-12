import { neon } from "@neondatabase/serverless"
import { getDbClient } from "./db"

// Get database connection
const getDbConnection = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connectionString) {
    throw new Error("Database connection string not found")
  }
  return neon(connectionString)
}

export async function inspectTable(tableName: string) {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    console.log(`Checking if table ${tableName} exists...`)

    // Check if table exists - use a more direct approach
    const tableCheck = await sql`
      SELECT to_regclass('public.${sql.unsafe(tableName)}') IS NOT NULL AS exists;
    `

    const tableExists = tableCheck[0]?.exists || false
    console.log(`Table ${tableName} exists: ${tableExists}`)

    if (!tableExists) {
      return {
        success: false,
        message: `Table ${tableName} does not exist`,
        exists: false,
      }
    }

    // Get table columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    console.log(`Found ${columns.length} columns in table ${tableName}`)

    // Get primary key
    const primaryKey = await sql`
      SELECT a.attname
      FROM   pg_index i
      JOIN   pg_attribute a ON a.attrelid = i.indrelid
                           AND a.attnum = ANY(i.indkey)
      WHERE  i.indrelid = ${sql.unsafe(`public.${tableName}`)}::regclass
      AND    i.indisprimary;
    `

    // Get foreign keys
    const foreignKeys = await sql`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = ${tableName};
    `

    return {
      success: true,
      exists: true,
      columns,
      primaryKey: primaryKey.map((pk) => pk.attname),
      foreignKeys,
      message: `Found ${columns.length} columns in ${tableName}`,
    }
  } catch (error) {
    console.error(`Error inspecting table ${tableName}:`, error)
    return {
      success: false,
      message: `Error inspecting table: ${error instanceof Error ? error.message : "Unknown error"}`,
      error,
      exists: false,
    }
  }
}

export async function getValidForeignKeyValues(tableName: string, columnName: string) {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    // Get foreign key information
    const foreignKeyInfo = await sql`
      SELECT
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = ${tableName}
        AND kcu.column_name = ${columnName};
    `

    if (foreignKeyInfo.length === 0) {
      return { success: false, message: `No foreign key found for ${tableName}.${columnName}` }
    }

    const foreignTable = foreignKeyInfo[0].foreign_table_name
    const foreignColumn = foreignKeyInfo[0].foreign_column_name

    // Get valid values from the referenced table
    const validValues = await sql`
      SELECT ${sql.unsafe(foreignColumn)}, name
      FROM ${sql.unsafe(foreignTable)}
      LIMIT 10;
    `

    return {
      success: true,
      foreignTable,
      foreignColumn,
      validValues,
      message: `Found ${validValues.length} valid values for ${tableName}.${columnName}`,
    }
  } catch (error) {
    console.error(`Error getting valid foreign key values:`, error)
    return {
      success: false,
      message: `Error getting valid foreign key values: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function testInsertWithSchema(tableName: string) {
  try {
    const schema = await inspectTable(tableName)
    if (!schema.success || !schema.exists) {
      return { success: false, message: `Table ${tableName} does not exist or could not be inspected` }
    }

    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    // Check for foreign keys and get valid values
    const foreignKeyColumns = schema.foreignKeys?.map((fk) => fk.column_name) || []
    const foreignKeyValues = {}

    for (const fkColumn of foreignKeyColumns) {
      const validValues = await getValidForeignKeyValues(tableName, fkColumn)
      if (validValues.success && validValues.validValues.length > 0) {
        // Use the first valid value for the test insert
        foreignKeyValues[fkColumn] = validValues.validValues[0][validValues.foreignColumn]
      } else {
        return {
          success: false,
          message: `Could not find valid values for foreign key ${fkColumn}. Please ensure there are records in the referenced table.`,
        }
      }
    }

    // Build a dynamic insert based on the actual schema
    const columnNames = []
    const placeholders = []
    const values = []

    schema.columns.forEach((col) => {
      // Skip auto-generated columns like serial IDs and timestamps with defaults
      if (
        col.column_default &&
        (col.column_default.includes("nextval") || col.column_default.includes("CURRENT_TIMESTAMP"))
      ) {
        return
      }

      columnNames.push(col.column_name)
      placeholders.push(`$${columnNames.length}`)

      // Add appropriate test value based on data type
      if (foreignKeyColumns.includes(col.column_name)) {
        // Use valid foreign key value
        values.push(foreignKeyValues[col.column_name])
      } else {
        switch (col.data_type) {
          case "integer":
          case "bigint":
          case "smallint":
            values.push(1)
            break
          case "numeric":
          case "decimal":
          case "real":
          case "double precision":
            values.push(1.0)
            break
          case "boolean":
            values.push(true)
            break
          case "json":
          case "jsonb":
            values.push(JSON.stringify(["test"]))
            break
          case "text":
          case "character varying":
          case "varchar":
          case "char":
          case "character":
            values.push(`Test ${col.column_name}`)
            break
          default:
            values.push(null)
        }
      }
    })

    // Construct the query
    const query = `
      INSERT INTO ${tableName} (${columnNames.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `

    console.log("Test insert query:", query)
    console.log("Test insert values:", values)

    // Execute the query
    const result = await sql.query(query, values)

    return {
      success: true,
      message: "Test insert successful",
      insertedRow: result.rows[0],
      schema,
      foreignKeyValues,
    }
  } catch (error) {
    console.error(`Error in test insert for ${tableName}:`, error)
    return {
      success: false,
      message: `Error in test insert: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getCompanies() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available", companies: [] }
    }

    // Check if companies table exists
    const tableExists = await sql`
      SELECT to_regclass('public.companies') IS NOT NULL AS exists;
    `

    if (!tableExists[0]?.exists) {
      // Try alternative table names
      const alternativeTableExists = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE '%company%' OR table_name LIKE '%employer%')
        LIMIT 1;
      `

      if (alternativeTableExists.length === 0) {
        console.log("No companies table found, creating a dummy company")
        // Create a dummy company for testing
        return {
          success: true,
          companies: [{ id: 1, name: "Test Company" }],
        }
      }

      // Use the alternative table
      const tableName = alternativeTableExists[0].table_name
      console.log(`Using alternative table for companies: ${tableName}`)

      // Get table structure to find id and name columns
      const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `

      // Find id and name columns
      const idColumn =
        columns.find(
          (col) => col.column_name === "id" || col.column_name.endsWith("_id") || col.column_name.includes("id"),
        )?.column_name || "id"

      const nameColumn =
        columns.find(
          (col) => col.column_name === "name" || col.column_name.includes("name") || col.column_name === "title",
        )?.column_name || "name"

      console.log(`Using columns: ${idColumn} (id) and ${nameColumn} (name)`)

      // Query the alternative table
      const companies = await sql`
        SELECT ${sql.unsafe(idColumn)} as id, ${sql.unsafe(nameColumn)} as name
        FROM ${sql.unsafe(tableName)}
        LIMIT 100;
      `

      console.log(`Found ${companies.length} companies in ${tableName}`)

      return {
        success: true,
        companies: companies.map((c) => ({
          id: c.id,
          name: c.name || `Company ${c.id}`,
        })),
      }
    }

    // Query the companies table
    const companies = await sql`
      SELECT id, name 
      FROM companies 
      LIMIT 100;
    `

    console.log(`Found ${companies.length} companies in companies table`)

    return {
      success: true,
      companies,
    }
  } catch (error) {
    console.error("Error fetching companies:", error)

    // Create a dummy company for testing
    return {
      success: true,
      companies: [{ id: 1, name: "Test Company" }],
    }
  }
}

// Function to create a companies table if it doesn't exist
export async function ensureCompaniesTable() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    // Check if companies table exists
    const tableExists = await sql`
      SELECT to_regclass('public.companies') IS NOT NULL AS exists;
    `

    if (!tableExists[0]?.exists) {
      console.log("Companies table does not exist, creating it...")

      // Create the companies table
      await sql`
        CREATE TABLE IF NOT EXISTS companies (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          website VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Insert a test company
      await sql`
        INSERT INTO companies (name, description, website)
        VALUES ('Test Company', 'A test company for development', 'https://example.com')
        ON CONFLICT (id) DO NOTHING
      `

      console.log("Companies table created and test company inserted")

      return {
        success: true,
        message: "Companies table created successfully",
      }
    }

    return {
      success: true,
      message: "Companies table already exists",
    }
  } catch (error) {
    console.error("Error ensuring companies table:", error)
    return {
      success: false,
      message: `Error ensuring companies table: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getTableColumns(tableName: string) {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available", columns: [] }
    }

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = ${tableName}
      );
    `

    if (!tableExists[0]?.exists) {
      return { success: false, error: "Table does not exist", columns: [] }
    }

    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    return { success: true, columns }
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      columns: [],
    }
  }
}

export async function dropTable(tableName: string) {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available" }
    }

    // Drop the table if it exists
    await sql`
      DROP TABLE IF EXISTS ${sql(tableName)};
    `

    return { success: true, message: `Table ${tableName} dropped successfully` }
  } catch (error) {
    console.error(`Error dropping table ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
