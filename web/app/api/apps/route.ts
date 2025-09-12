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

    const response = await fetch(`${apiUrl}/apps/user`, {
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

    const response = await fetch(`${apiUrl}/apps`, {
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

export async function PUT(
  request: NextRequest,
) {
  try {
    const secretString = process.env.NEXTAUTH_SECRET!;
    const jwtString = await getToken({
      req: request,
      raw: true,
      secret: secretString
    });

    if (!jwtString) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const response = await fetch(`${apiUrl}/apps/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtString}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to update job' },
        { status: response.status }
      );
    }

    const updatedJob = await response.json();
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const secretString = process.env.NEXTAUTH_SECRET!;
    const jwtString = await getToken({ req: request, raw: true, secret: secretString });

    if (!jwtString) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    const response = await fetch(`${apiUrl}/apps/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwtString}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete job');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
