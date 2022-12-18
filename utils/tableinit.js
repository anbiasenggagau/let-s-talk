const { nanoid } = require('nanoid')

async function initialization(database) {
    let query =
        `
        CREATE TABLE IF NOT EXISTS "users" (
        "id" VARCHAR(6) NOT NULL UNIQUE,
        "name" VARCHAR(50) NOT NULL,
        "username" VARCHAR(15) UNIQUE NOT NULL UNIQUE,
        PRIMARY KEY("id")
);
`
    await database.query(query)

    result = await database.query(`SELECT * FROM users`)

    if (result.rows.length === 0) {

        query = `
        INSERT INTO users (id,name,username) VALUES
        ('QWEQWE','Admin','superadmin');

        CREATE TABLE IF NOT EXISTS "QWEQWE" (
            "idmessage" VARCHAR(10) NOT NULL UNIQUE,
			"from" VARCHAR(6) NOT NULL,
		    "to" VARCHAR(6) NOT NULL,
            "message" VARCHAR(50) NOT NULL,
            "timestamp" TIMESTAMP NOT NULL,
		    "replyto" VARCHAR(10) NULL,
            PRIMARY KEY("idmessage"),
		        CONSTRAINT "fk_from"
			        FOREIGN KEY ("from")
				        REFERENCES users(id)
        );

        ALTER TABLE "QWEQWE"
        ADD constraint "fk_to"
        FOREIGN KEY ("to")
        REFERENCES users(id);`

        query += `
        INSERT INTO users (id,name,username) VALUES
        ('EWQEWQ','User','user');

        CREATE TABLE IF NOT EXISTS "EWQEWQ" (
            "idmessage" VARCHAR(10) NOT NULL UNIQUE,
			"from" VARCHAR(6) NOT NULL,
		    "to" VARCHAR(6) NOT NULL,
            "message" VARCHAR(50) NOT NULL,
            "timestamp" TIMESTAMP NOT NULL,
		    "replyto" VARCHAR(10) NULL,
            PRIMARY KEY("idmessage"),
		        CONSTRAINT "fk_from"
			        FOREIGN KEY ("from")
				        REFERENCES users(id)
        );

        ALTER TABLE "EWQEWQ"
        ADD constraint "fk_to"
        FOREIGN KEY ("to")
        REFERENCES users(id);

        INSERT INTO "EWQEWQ" ("idmessage","from","to","message","timestamp") VALUES
		('${nanoid(10)}','QWEQWE','EWQEWQ','Hi, I''m your admin',current_timestamp);
        `

        await database.query(query)
    }

    return true
}

module.exports = initialization