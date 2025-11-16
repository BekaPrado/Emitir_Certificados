const certificadoDAO = require("../dao/certificadosDAO");

module.exports = {
    async emitirCertificado(req, res) {
        try {
            const certificado = req.body;
            if (!certificado.id_usuario || !certificado.curso || !certificado.data_conclusao) {
                return res.status(400).json({ error: "Preencha todos os campos obrigatórios!" });
            }
            const novo = await certificadoDAO.create(certificado);
            res.status(201).json(novo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async listarCertificados(req, res) {
        try {
            const lista = await certificadoDAO.findAll();
            res.json(lista);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const certificado = await certificadoDAO.findById(id);
            if (!certificado) return res.status(404).json({ error: "Certificado não encontrado!" });
            res.json(certificado);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deletarCertificado(req, res) {
        try {
            const { id } = req.params;
            const result = await certificadoDAO.delete(id);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async buscarPorCNPJ(req, res) {
        try {
            const { cnpj } = req.params;

            const [rows] = await db.query(
                "SELECT * FROM empresas_certificados WHERE cnpj = ?",
                [cnpj.replace(/\D/g, "")]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "CNPJ não encontrado" });
            }

            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async downloadCertificado(req, res) {
        try {
            const { cnpj } = req.params;

            const [rows] = await db.query(
                "SELECT * FROM empresas_certificados WHERE cnpj = ?",
                [cnpj.replace(/\D/g, "")]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "CNPJ não encontrado" });
            }

            const empresa = rows[0];

            gerarCertificado(empresa, res);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
