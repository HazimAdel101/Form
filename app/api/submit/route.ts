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
      let errorMessage = 'Failed to submit form to external endpoint';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch {
          // Use default error message
        }
      }
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }
    
    // Try to parse JSON response, but handle cases where webhook might return empty or plain text
    const contentType = response.headers.get('content-type');
    let result: any = { success: true };
    
    try {
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          result = { message: text };
        }
      }
    } catch {
      // If response body is empty or unparseable, use default success result
    }
    
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

