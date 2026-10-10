import { supabase } from './supabase'

export async function raisePickupRequest(cartonId, locationId, remarks) {
  const now = new Date().toISOString()
  const reqId = `REQ-PK-${Date.now()}`

  // 1. Fetch carton info
  const { data: carton } = await supabase
    .from('carton_inventory')
    .select('*')
    .eq('carton_id', cartonId)
    .single()

  // 2. Update carton status
  await supabase
    .from('carton_inventory')
    .update({ current_status: 'Pickup Requested' })
    .eq('carton_id', cartonId)

  // 3. Insert operational request
  await supabase.from('requests').insert({
    request_id: reqId,
    request_type: 'PICKUP',
    carton_id: cartonId,
    entity_id: carton?.entity_id,
    department_id: carton?.department_id,
    raised_by: carton?.owner_user_id || 'BUSINESS',
    raised_on: now,
    vendor_id: carton?.assigned_vendor_id,
    sla_days: 2,
    request_status: 'Open',
    remarks: remarks || ''
  })

  // 4. Record immutable audit event
  await supabase.from('event_log').insert({
    event_id: `EVT-${Date.now()}`,
    carton_id: cartonId,
    event_timestamp: now,
    event_type: 'PICKUP_REQUESTED',
    from_location: locationId || carton?.current_location_id,
    to_location: carton?.assigned_vendor_id,
    actor_type: 'BUSINESS',
    actor_id: carton?.owner_user_id || 'BUSINESS',
    request_id: reqId,
    resulting_status: 'Pickup Requested'
  })

  return { request_id: reqId }
}

export async function processPickupAction(requestId, actionType) {
  const now = new Date().toISOString()
  
  // 1. Fetch request details
  const { data: req, error: reqErr } = await supabase
    .from('requests')
    .select('*, carton_inventory(*)')
    .eq('request_id', requestId)
    .single()
  
  if (reqErr || !req) {
    throw new Error(reqErr?.message || 'Request not found')
  }

  const cartonId = req.carton_id

  if (actionType === 'ACKNOWLEDGE') {
    await supabase
      .from('requests')
      .update({ vendor_ack_on: now, request_status: 'In Progress' })
      .eq('request_id', requestId)

    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`,
      carton_id: cartonId,
      event_timestamp: now,
      event_type: 'PICKUP_ACKNOWLEDGED',
      actor_type: 'VENDOR',
      actor_id: req.vendor_id,
      request_id: requestId,
      resulting_status: 'In Progress'
    })
  } else if (actionType === 'COLLECT') {
    await supabase
      .from('carton_inventory')
      .update({ current_status: 'In Transit to Vendor' })
      .eq('carton_id', cartonId)

    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`,
      carton_id: cartonId,
      event_timestamp: now,
      event_type: 'PICKED_UP_BY_VENDOR',
      from_location: req.department_id,
      to_location: req.vendor_id,
      actor_type: 'VENDOR',
      actor_id: req.vendor_id,
      request_id: requestId,
      resulting_status: 'In Transit to Vendor'
    })
  } else if (actionType === 'RECEIVE') {
    const warehouseLoc = 'LOC-DEL-01'
    await supabase
      .from('carton_inventory')
      .update({ current_status: 'In Storage', current_location_id: warehouseLoc })
      .eq('carton_id', cartonId)

    await supabase
      .from('requests')
      .update({ completed_on: now, request_status: 'Completed' })
      .eq('request_id', requestId)

    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`,
      carton_id: cartonId,
      event_timestamp: now,
      event_type: 'RECEIVED_AT_WAREHOUSE',
      to_location: warehouseLoc,
      actor_type: 'VENDOR',
      actor_id: req.vendor_id,
      request_id: requestId,
      resulting_status: 'In Storage'
    })
  } else {
    throw new Error(`Unknown action type: ${actionType}`)
  }

  return { success: true }
}
