import { NextRequest, NextResponse } from 'next/server';
import { formSchema } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = formSchema.parse(body);
    
    // Prepare data for external endpoint
    const formData = {
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      notes: validatedData.notes || null,
      price: validatedData.price,
      service: validatedData.service,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
    };
    
    // Call external endpoint
    const endpointUrl = process.env.API_ENDPOINT_URL || 'https://n8n.marevo.info/webhook/new-subscription';
    
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to submit form to external endpoint' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

