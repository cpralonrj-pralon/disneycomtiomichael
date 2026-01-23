-- Enable Realtime for Support Chats and Messages
-- This allows the Admin Dashboard and Chatbot to receive live updates

ALTER PUBLICATION supabase_realtime ADD TABLE support_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
