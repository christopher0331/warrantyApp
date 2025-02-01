# GreenView Solutions Warranty App

A web-based platform for GreenView Solutions (GVS) with separate dashboards for employees and customers. The app streamlines user access and management by dynamically assigning user roles based on email domain and providing tailored functionality for each type of user.

## Features

### Employee Dashboard
- Customer profile creation and management
- View and manage customer warranties
- Track maintenance schedules
- Monitor service requests

### Customer Dashboard
- View maintenance schedule
- Request additional services
- Check warranty status
- Access fence profile information

## Tech Stack

- Frontend: React.js with Vite
- Styling: TailwindCSS
- Authentication & Database: Supabase
- Routing: React Router

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account and project

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd warrantyApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up the Supabase database tables:

```sql
-- Create customers table
create table customers (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone_numbers jsonb,
  address text,
  notes text,
  fence_length integer,
  install_date date,
  fence_type text,
  gates integer,
  color text,
  warranty_status text,
  warranty_issue_date date,
  next_review_date date,
  next_maintenance_date date,
  maintenance_schedule jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create service_requests table
create table service_requests (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id),
  service_type text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up row level security
alter table customers enable row level security;
alter table service_requests enable row level security;

-- Create policies for customers table
create policy "Employees can view all customers"
  on customers for select
  to authenticated
  using (auth.email() like '%@greenviewsolutions.net' or auth.email() like '%@gvsco.net');

create policy "Customers can view their own data"
  on customers for select
  to authenticated
  using (email = auth.email());

create policy "Employees can create customers"
  on customers for insert
  to authenticated
  with check (
    auth.email() like '%@greenviewsolutions.net' or 
    auth.email() like '%@gvsco.net'
  );

-- Create policies for service_requests table
create policy "Customers can view their own service requests"
  on service_requests for select
  to authenticated
  using (customer_id in (
    select id from customers 
    where email = auth.email()
  ));

create policy "Employees can view all service requests"
  on service_requests for select
  to authenticated
  using (
    auth.email() like '%@greenviewsolutions.net' or 
    auth.email() like '%@gvsco.net'
  );

create policy "Customers can create service requests"
  on service_requests for insert
  to authenticated
  with check (
    customer_id in (
      select id from customers 
      where email = auth.email()
    )
  );
```

5. Start the development server:
```bash
npm run dev
```

## Development

The app uses the following structure:
- `/src/pages/`: Main page components
- `/src/components/`: Reusable UI components
- `/src/contexts/`: React contexts (Auth)
- `/src/lib/`: Utility functions and configurations

## Production Build

To create a production build:
```bash
npm run build
```

The build output will be in the `dist` directory.

## License

[License Type] [Year] GreenView Solutions
