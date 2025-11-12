// index.js

require('dotenv').config(); 
const { Client, GatewayIntentBits } = require('discord.js');

// 1. CONFIGURACIÓN DE INTENTS: Añadimos DirectMessages
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages // ¡NECESARIO PARA MENSAJES DIRECTOS!
    ] 
});

client.once('ready', () => {
    console.log(`✅ ¡Bot conectado como ${client.user.tag}!`);
    console.log('Ahora usa "!reenviar @usuario1 @usuario2" respondiendo a un mensaje.');
});

// --- Lógica de Reenvío por Mensaje Directo (DM) ---
client.on('messageCreate', async message => {
    // 2. Comprobar el comando y que NO sea un Bot
    if (message.author.bot || !message.content.startsWith('!reenviar')) return;

    // 3. Obtener el mensaje original al que se está respondiendo
    const referencedMessage = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : null;

    if (!referencedMessage) {
        return message.reply("Debes responder (Reply) a un mensaje para poder reenviarlo.");
    }
    
    // 4. Obtener la lista de usuarios mencionados
    const recipients = message.mentions.users;
    
    if (recipients.size === 0) {
        return message.reply("Debes mencionar a uno o más usuarios después de !reenviar.");
    }

    let successCount = 0;
    
    // 5. Recorrer la lista de usuarios y enviarles el DM
    for (const [id, user] of recipients) {
        try {
            await user.send(
                `**📢 Mensaje de ${referencedMessage.author.username} en el servidor ${message.guild.name}:**\n\n` + 
                referencedMessage.content
            );
            successCount++;
        } catch (error) {
            // Esto capturará errores si el usuario tiene DMs bloqueados
            console.error(`No se pudo enviar DM a ${user.tag}: ${error.message}`);
        }
    }

    // 6. Confirmación en el canal original
    if (successCount > 0) {
        message.react('✅');
        message.reply(`Mensaje reenviado exitosamente a **${successCount}** usuario(s) por mensaje directo.`);
    } else {
        message.reply('No se pudo reenviar el mensaje a ningún usuario (posiblemente tienen los DMs bloqueados).');
    }
});

client.login(process.env.DISCORD_TOKEN);