const config = require('../config');

const { exec } = require('child_process');

const container = 'url_shortener_postgres'; // container name
const user = config.pgConfig.user
const db = config.pgConfig.database;

// SQL script to run inside the container
const sql = `
CREATE TABLE IF NOT EXISTS keys (
    short_url_id VARCHAR(7) PRIMARY KEY,
    used BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION generate_random_key(length INTEGER DEFAULT 7) 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE populate_keys(total_count INTEGER, batch_size INTEGER DEFAULT 10000)
AS $$
DECLARE
    i INTEGER;
    generated_key TEXT;
BEGIN
    FOR i IN 1..(total_count/batch_size) LOOP
        BEGIN
            FOR j IN 1..batch_size LOOP
                generated_key := generate_random_key();
                INSERT INTO keys (short_url_id, used) 
                VALUES (generated_key, FALSE)
                ON CONFLICT (short_url_id) DO NOTHING;
            END LOOP;
            RAISE NOTICE 'Inserted % keys...', i * batch_size;
        EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error in batch %: %', i, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CALL populate_keys(100000);
SELECT * FROM keys LIMIT 10;
`;

function runSQL() {
    const command = `docker exec -i ${container} psql -U ${user} -d ${db}`;

    const child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`STDERR: ${stderr}`);
        }
        console.log(`Output:\n${stdout}`);
    });

    child.stdin.write(sql);
    child.stdin.end();
}

runSQL();
