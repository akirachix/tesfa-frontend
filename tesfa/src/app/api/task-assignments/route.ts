import { NextRequest } from "next/server";
import { getToken } from "../../utils/getToken";

const baseUrl = process.env.BASE_URL;

export async function GET(request: NextRequest) {
  const token = getToken(request);
  try {
    const response = await fetch(`${baseUrl}/task-assignments/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API failed with status ${response.status}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        
      },
    });
  } catch (error) {
    return new Response((error as Error).message, {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);

  const bodyData = await request.json();
  const { task, organization } = bodyData;

  if (!task || !organization) {
    return new Response("Missing task or organization field", {
      status: 400,
    });
  }

  try {
    const response = await fetch(`${baseUrl}/task-assignments/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task,
        organization,
        status: "pending",
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 201,
      statusText: "Assignment created successfully",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response((error as Error).message, {
      status: 500,
    });
  }
}

export async function DELETE(request: NextRequest) {
  const token = getToken(request);
  try {
    const url = new URL(request.url);
    const assignmentId = url.searchParams.get("assignmentId");

    if (!assignmentId) {
      return new Response("Missing assignmentId parameter", { status: 400 });
    }

    const response = await fetch(
      `${baseUrl}/task-assignments/${assignmentId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) {
      return new Response("Failed to delete task assignment", { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response((error as Error).message, { status: 500 });
  }
}
