const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS completo
app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());

app.use(express.json());

// ✅ CONFIGURAÇÃO MAIS SIMPLES (remove otimizações que podem atrapalhar)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
  // ⚠️ Removidas otimizações que podem causar timeout
});

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 DJ Sampa Email Server Online!',
    status: 'OK'
  });
});

// ✅ Rota POST com timeout MAIOR (30 segundos)
app.post('/send', async (req, res) => {
  console.log('📨 Recebendo email...', req.body);
  
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: 'Todos os campos são obrigatórios!'
    });
  }

  try {
    // ✅ EMAIL SUPER SIMPLES (só texto)
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `🎵 Contato DJ Sampa - ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
      // ❌ Removido HTML para ser mais rápido
    };

    console.log('📤 Enviando email...');
    
    // ✅ TIMEOUT MAIOR (30 segundos)
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Email demorou mais de 30 segundos')), 30000)
    );

    await Promise.race([emailPromise, timeoutPromise]);
    
    console.log(`✅ Email enviado com sucesso: ${name}`);
    
    res.json({
      ok: true,
      message: 'Email enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    
    if (error.message.includes('Timeout')) {
      res.status(408).json({
        ok: false,
        error: 'Servidor ocupado. O email pode ter sido enviado mesmo assim. Tente novamente em alguns segundos.'
      });
    } else {
      res.status(500).json({
        ok: false,
        error: 'Erro interno: ' + error.message
      });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'DJ Sampa Email' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});