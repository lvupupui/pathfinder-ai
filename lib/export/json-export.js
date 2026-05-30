export function generateJsonExport(conversation) {
  return JSON.stringify(
    {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages,
    },
    null,
    2
  );
}