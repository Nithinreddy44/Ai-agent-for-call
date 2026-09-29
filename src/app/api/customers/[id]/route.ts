import { NextResponse } from 'next/server';
import { INITIAL_CUSTOMERS } from '@/lib/store';
import { Customer } from '@/lib/types';
import { validatePhoneNumber } from '@/lib/validation';

let customersData: Customer[] = [...INITIAL_CUSTOMERS];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const customer = customersData.find(c => c.id === params.id);
  if (!customer) {
    return NextResponse.json({ success: false, error: 'Customer not found.' }, { status: 44 });
  }
  return NextResponse.json({ success: true, customer });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const idx = customersData.findIndex(c => c.id === params.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Customer not found.' }, { status: 404 });
    }

    if (body.phone) {
      const phoneVal = validatePhoneNumber(body.phone);
      if (!phoneVal.valid) {
        return NextResponse.json({ success: false, error: phoneVal.error }, { status: 422 });
      }
      body.phone = phoneVal.formatted || body.phone;
    }

    customersData[idx] = {
      ...customersData[idx],
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully.',
      customer: customersData[idx],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idx = customersData.findIndex(c => c.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Customer not found.' }, { status: 404 });
  }

  const deleted = customersData.splice(idx, 1)[0];
  return NextResponse.json({
    success: true,
    message: 'Customer deleted successfully.',
    customer: deleted,
  });
}
