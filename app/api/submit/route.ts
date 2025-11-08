import { NextRequest, NextResponse } from 'next/server';
import { formSchema } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the form data
    const validatedData = formSchema.parse(body);
    
    // Prepare data for external endpoint
    // Map form fields to external API expected field names
    const formData = {
      name: validatedData.name,
      phone_number: validatedData.phone,
      email: validatedData.email,
      notes: validatedData.notes || null,
      service_price: validatedData.price,
      service_name: validatedData.service,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
    };
    
    // Call external endpoint
    const endpointUrl = process.env.API_ENDPOINT_URL || 'https://n8n.marevo.info/webhook/new-subscription';
    
    console.log('Submitting to webhook:', endpointUrl);
    console.log('Form data:', JSON.stringify(formData, null, 2));
    
    let response: Response;
    try {
      response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          message: `Network error: ${fetchError.message || 'Failed to connect to webhook endpoint'}` 
        },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      let errorMessage = `Failed to submit form to external endpoint (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch {
          // Use default error message with status
        }
      }
      console.error('Webhook error response:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage
      });
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

