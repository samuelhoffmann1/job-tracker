import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.API_URL!;

export async function GET(request: NextRequest) {
  try {
    const secretString = process.env.NEXTAUTH_SECRET!;
    const jwtString = await getToken({ req: request, raw: true, secret: secretString });

    if (!jwtString) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${apiUrl}/jobs/user`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtString}`,
      },
    });


    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await response.json();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const secretString = process.env.NEXTAUTH_SECRET!;
    const jwtString = await getToken({ req: request, raw: true, secret: secretString });

    if (!jwtString) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${apiUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtString}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create job');
    }

    const job = await response.json();
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
