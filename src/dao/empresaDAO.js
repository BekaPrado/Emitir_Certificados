const pool = require("../config/db");

module.exports = {

    async insertOrUpdate(empresa) {
        const sql = `
            INSERT INTO empresas_certificados 
                (razao_social, texto_trofeu, categoria, cnpj)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                razao_social = VALUES(razao_social),
                texto_trofeu = VALUES(texto_trofeu),
                categoria = VALUES(categoria)
        `;

        const values = [
            empresa.razao_social,
            empresa.texto_trofeu,
            empresa.categoria,
            empresa.cnpj
        ];

        await pool.query(sql, values);
    },

    async findByCnpj(cnpj) {
        const [rows] = await pool.query(
            "SELECT * FROM empresas_certificados WHERE cnpj = ?",
            [cnpj]
        );

        return rows[0];
    }
};
