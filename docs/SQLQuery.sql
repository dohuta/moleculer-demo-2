--------------------------
--     CREATE LOGIN     --
--------------------------

IF SUSER_ID('TodoAdLogin') IS NULL 
    CREATE LOGIN TodoAdLogin WITH PASSWORD = '@abc12345';
GO

--------------------------
--    CREATE DATABASE   --
--------------------------

-- Drop the database 'TodosDB'
-- Connect to the 'master' database to run this snippet
USE master
GO
-- Uncomment the ALTER DATABASE statement below to set the database to SINGLE_USER mode if the drop database command fails because the database is in use.
-- ALTER DATABASE TodosDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- Drop the database if it exists
IF EXISTS (
    SELECT [name]
FROM sys.databases
WHERE [name] = N'TodosDB'
)
DROP DATABASE TodosDB
GO

-- Create a new database called 'TodosDB'
-- Connect to the 'master' database to run this snippet
USE master
GO
-- Create the new database if it does not exist already
IF NOT EXISTS (
    SELECT [name]
FROM sys.databases
WHERE [name] = N'TodosDB'
)
CREATE DATABASE TodosDB
GO

--------------------------
--      CREATE USER     --
--------------------------

USE TodosDB
GO

IF  EXISTS (SELECT * FROM sys.database_principals WHERE name = N'TodoAdmin')
DROP USER [TodoAdmin]
IF USER_ID('TodoAdmin') IS NULL
    CREATE USER TodoAdmin FOR LOGIN TodoAdLogin
GO

--------------------------
--      ASSIGN ROLE     --
--------------------------

ALTER ROLE db_owner ADD MEMBER [TodoAdmin]

--------------------------
--     CREATE TABLES    --
--------------------------

-- Create a new table called '[User]' in schema '[dbo]'
-- Drop the table if it already exists
IF OBJECT_ID('[dbo].[User]', 'U') IS NOT NULL
DROP TABLE [dbo].[User]
GO
-- Create the table in the specified schema
CREATE TABLE [dbo].[User]
(
    [id] INT NOT NULL PRIMARY KEY IDENTITY(1,1),
    -- Primary Key column
    [username] NVARCHAR(255) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [fullname] NVARCHAR(255),
    [deleted] BIT DEFAULT 0,
    [created_at] DATETIME2(3) CONSTRAINT DF_USER_created_at DEFAULT GETDATE(),
    [updated_at] DATETIME2(3)
    -- Specify more columns here
);
GO

--------------------------
--       DUMP DATA      --
--------------------------

-- Insert rows into table 'User' in schema '[dbo]'
INSERT INTO [dbo].[User]
    ( -- Columns to insert data into
    [username], [password], [fullname], [deleted]
    )
VALUES
    ( -- First row: values for the columns in the list above
        'demo1', '$2y$12$1xn2f/10DPwS/bg4Fs2YsOzh.f0uxcRvk9/Y7PSBAaQ9HWudRA266', 'demo account 1', 0
),
    ( -- Second row: values for the columns in the list above
        'demo2', '$2y$12$1xn2f/10DPwS/bg4Fs2YsOzh.f0uxcRvk9/Y7PSBAaQ9HWudRA266', 'demo account 2', 1
)
-- Add more rows here
GO

--------------------------
--        TRIGGER       --
--------------------------

IF EXISTS (
SELECT *
FROM INFORMATION_SCHEMA.ROUTINES
WHERE SPECIFIC_SCHEMA = N'dbo'
    AND SPECIFIC_NAME = N'tg_userUpdatedAt'
    AND ROUTINE_TYPE = N'TRIGGER'
)
DROP PROCEDURE dbo.tg_userUpdatedAt
GO
CREATE TRIGGER dbo.tg_userUpdatedAt ON [dbo].[User] FOR UPDATE
AS
BEGIN
    UPDATE [dbo].[User]
	SET [updated_at] = GETDATE()
	FROM [dbo].[User] INNER JOIN deleted d
        ON [dbo].[User].ID = d.id
END
GO

--------------------------
--   STORED PROCEDURE   --
--------------------------

-- Create a new stored procedure called 'sp_deleteOneUser' in schema 'dbo'
-- Drop the stored procedure if it already exists
IF EXISTS (
SELECT *
FROM INFORMATION_SCHEMA.ROUTINES
WHERE SPECIFIC_SCHEMA = N'dbo'
    AND SPECIFIC_NAME = N'sp_deleteOneUser'
    AND ROUTINE_TYPE = N'PROCEDURE'
)
DROP PROCEDURE dbo.sp_deleteOneUser
GO
-- Create the stored procedure in the specified schema
CREATE PROCEDURE dbo.sp_deleteOneUser
    @id int
--@param2 /*parameter name*/ int /*datatype_for_param1*/ = 0 /*default_value_for_param2*/
-- add more stored procedure parameters here
AS
BEGIN
    -- body of the stored procedure
    -- Update rows in table '[User]' in schema '[dbo]'
    UPDATE [dbo].[User]
    SET
        [deleted] = 1
    WHERE id = @id
END
GO
-- example to execute the stored procedure we just created
-- EXECUTE dbo.sp_deleteOneUser 1
-- GO