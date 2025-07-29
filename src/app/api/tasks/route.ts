import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ tasks: [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ task: body })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ task: body })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  return NextResponse.json({ success: true, id })
}