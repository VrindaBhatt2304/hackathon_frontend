import { supabase } from './supabase'

export async function processVendorAction(request, actionKey) {
  const now = new Date().toISOString()
  const reqId = request.request_id
  const cartonId = request.carton_id
  const vendorId = request.vendor_id || 'VND-001'

  if (request.request_type === 'PICKUP') {
    if (actionKey === 'ACKNOWLEDGE') {
      await supabase.from('requests').update({ vendor_ack_on: now, request_status: 'In Progress' }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'PICKUP_ACKNOWLEDGED',
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Progress'
      })
    } else if (actionKey === 'COLLECT') {
      await supabase.from('carton_inventory').update({ current_status: 'In Transit to Vendor' }).eq('carton_id', cartonId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'PICKED_UP_BY_VENDOR',
        from_location: request.department_id,
        to_location: vendorId,
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Transit to Vendor'
      })
    } else if (actionKey === 'RECEIVE') {
      const warehouseLoc = 'LOC-DEL-01'
      await supabase.from('carton_inventory').update({ current_status: 'In Storage', current_location_id: warehouseLoc }).eq('carton_id', cartonId)
      await supabase.from('requests').update({ completed_on: now, request_status: 'Completed' }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'RECEIVED_AT_WAREHOUSE',
        to_location: warehouseLoc,
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Storage'
      })
    }
  } else if (request.request_type === 'RETRIEVAL') {
    if (actionKey === 'ACKNOWLEDGE') {
      await supabase.from('requests').update({ vendor_ack_on: now, request_status: 'In Progress' }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'RETRIEVAL_ACKNOWLEDGED',
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Progress'
      })
    } else if (actionKey === 'DISPATCH') {
      await supabase.from('carton_inventory').update({ current_status: 'In Transit to Business' }).eq('carton_id', cartonId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'RETRIEVAL_DISPATCHED',
        to_location: request.department_id,
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Transit to Business'
      })
    } else if (actionKey === 'DELIVER') {
      await supabase.from('carton_inventory').update({ current_status: 'With Business', current_location_id: request.department_id }).eq('carton_id', cartonId)
      await supabase.from('requests').update({ completed_on: now, request_status: 'Completed' }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'RETRIEVAL_CONFIRMED',
        to_location: request.department_id,
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'With Business'
      })
    }
  } else if (request.request_type === 'RETURN' || request.request_type === 'REFILE') {
    if (actionKey === 'ACKNOWLEDGE') {
      await supabase.from('requests').update({ vendor_ack_on: now, request_status: 'In Progress' }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'REFILE_ACKNOWLEDGED',
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Progress'
      })
    } else if (actionKey === 'COLLECT') {
      await supabase.from('carton_inventory').update({ current_status: 'In Transit to Vendor' }).eq('carton_id', cartonId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'REFILE_PICKED_UP',
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Transit to Vendor'
      })
    } else if (actionKey === 'RECEIVE') {
      const warehouseLoc = 'LOC-DEL-01'
      await supabase.from('carton_inventory').update({ current_status: 'In Storage', current_location_id: warehouseLoc }).eq('carton_id', cartonId)
      await supabase.from('requests').update({ completed_on: now, request_status: 'Completed' }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'REFILE_RECEIVED_AT_WAREHOUSE',
        to_location: warehouseLoc,
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'In Storage'
      })
    }
  } else if (request.request_type === 'DESTRUCTION') {
    if (actionKey === 'DESTROY') {
      const certId = `DC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
      await supabase.from('carton_inventory').update({ current_status: 'Destroyed' }).eq('carton_id', cartonId)
      await supabase.from('requests').update({ completed_on: now, request_status: 'Completed', remarks: `Certificate: ${certId}` }).eq('request_id', reqId)
      await supabase.from('event_log').insert({
        event_id: `EVT-${Date.now()}`,
        carton_id: cartonId,
        event_timestamp: now,
        event_type: 'DESTROYED',
        actor_type: 'VENDOR',
        actor_id: vendorId,
        request_id: reqId,
        resulting_status: 'Destroyed',
        remarks: `Certified Destruction under Ref ${certId}`
      })
    }
  }

  return { success: true }
}
