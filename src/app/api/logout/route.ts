import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Delete the 'token' cookie.
    // The key thing is to ensure the 'path' attribute matches how the cookie was originally set.
    // Most commonly, authentication tokens are set with path: '/', so deleting with path: '/' is crucial.
    (await cookies()).delete("token");

    // You can delete other cookies if you have them, e.g.:
    // cookies().delete('another_session_cookie', { path: '/' });

    // Send a success response.
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for server-side debugging.
    console.error("Logout API Error:", error);

    // Return an error response to the client.
    return NextResponse.json(
      { error: "An unexpected error occurred during logout" },
      { status: 500 }
    );
  }
}
