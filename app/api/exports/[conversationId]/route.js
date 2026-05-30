import { respondError, ERROR_CODES } from "@/lib/api/error-handler";
import { generateJsonExport } from "@/lib/export/json-export";
import { getOwnedConversation } from "@/lib/conversation/getConversation";


export async function GET(request, context) {
  const params = await context.params;

  try {
    const result = await getOwnedConversation(params.conversationId);

    if (!result) {
      return respondError(ERROR_CODES.UNAUTHORIZED);
    }

    const { user, conversation } = result;

    if (!conversation) {
      return respondError(
        ERROR_CODES.RESOURCE_NOT_FOUND,
        "Conversation not found"
      );
    }

    const jsonData = generateJsonExport(conversation);

    // TODO: Create ExportRecord and AuditLog entries
    // after migrations are applied.

    console.log("Conversation exported", {
    userId: user.id,
    conversationId: conversation.id,
    format: "json",
    });

    return new Response(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${conversation.title}.json"`,
      },
    });
  } catch (error) {
    console.error("Export conversation error:", error);

    return respondError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "Failed to export conversation"
    );
  }
}