const xlsx = require("xlsx");
const dao = require("../dao/empresaCertificadoDAO");

exports.uploadEmpresas = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        for (const row of rows) {

            const cnpjRaw =
                row["CNPJ para confrimacao"] ||
                row["CNPJ para confirmacao"] ||
                row["CNPJ"] ||
                row["cnpj"] ||
                row["CNPJ "] ||
                row["Cnpj"] ||
                null;

            const empresa = {
                razao_social:
                    row["Razão Social"] ||
                    row["Razao Social"] ||
                    null,

                texto_trofeu:
                    row["TEXTO PARA TROFEU"] ||
                    row["Texto para Trofeu"] ||
                    row["Texto para troféu"] ||
                    null,

                categoria:
                    row["CATEGORIA (texto 2)"] ||
                    row["Categoria"] ||
                    null,

                cnpj: cnpjRaw ? cnpjRaw.toString().replace(/\D/g, "") : null
            };

            // SE NÃO TIVER CNPJ → PULA (NÃO CANCELA O UPLOAD)
            if (!empresa.cnpj || empresa.cnpj.length < 14) {
                console.log("Linha ignorada por CNPJ inválido:", row);
                continue;  // 👈 AGORA NÃO CANCELA O UPLOAD
            }

            await dao.insertOrUpdate(empresa);
        }

        res.json({ message: "Planilha importada com sucesso!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar planilha" });
    }
};
