import { NextResponse } from "next/server";
import { getAuthData } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = getAuthData(req);

        return NextResponse.json(
            { message: "Authorized", user },
            { status: 200 }
        );
    } catch (error) {
        console.error("Auth error:", error);

        if (error instanceof Error) {
            if (error.message === "Unauthorized") {
                return NextResponse.json(
                    { message: "Unauthorized: Missing or invalid token format" },
                    { status: 401 }
                );
            }
            // JWT library errors usually have specific names
            if (
                error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError" ||
                error.message === "Invalid token payload" ||
                error.message === "Invalid token structure"
            ) {
                return NextResponse.json(
                    { message: "Unauthorized: Invalid or expired token" },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
