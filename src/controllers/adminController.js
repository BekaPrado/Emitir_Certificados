const adminDAO = require("../dao/adminDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            console.log("\n=== LOGIN DEBUG ===");
            console.log("Email recebido:", `"${email}"`);
            console.log("Senha recebida:", `"${senha}"`);

            const admin = await adminDAO.findByEmail(email);

            console.log("Admin encontrado no banco:", admin);

            if (!admin) {
                console.log("❌ Nenhum admin encontrado com esse email!");
                return res.status(404).json({ error: "Admin não encontrado" });
            }

            // Mostrar senha do banco
            console.log("Senha do banco:", `"${admin.senha}"`);

            // Comparação literal (já que sua senha não é criptografada)
            const match = senha === admin.senha;
            console.log("As senhas são iguais?", match);

            if (!match) {
                console.log("❌ Senha incorreta!");
                return res.status(401).json({ error: "Senha incorreta" });
            }

            // Se chegou aqui, está tudo certo
            const token = jwt.sign(
                { id: admin.id, email: admin.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            console.log("✅ Login bem-sucedido! Token gerado.");

            res.json({ token });

        } catch (err) {
            console.log("🔥 ERRO NO LOGIN:", err);
            res.status(500).json({ error: err.message });
        }
    }
};
