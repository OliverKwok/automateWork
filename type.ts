export interface Wip {
  job_number: string; // SBE job number
  sn: string;
  status: string;
}

export interface WorkOrder {
  supplier: string;
  work_order_id: string;
  work_order_number: string;
  status: string;
  sn: string;
  product_series: string;
  model_name: string;
  internal_name: string;
  order_created_date: string;
}
