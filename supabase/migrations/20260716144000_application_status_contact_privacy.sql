-- Never expose the candidate's own contact details as the employer contact.
-- Keep the offer payload introduced by 20260712240000_offers.sql.
create or replace function get_application_status(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  a applications;
  v vacancies;
  timeline jsonb;
  offer jsonb;
  employer_contact jsonb;
begin
  select * into a from applications where access_token = p_token;
  if not found then return null; end if;
  select * into v from vacancies where id = a.vacancy_id;

  select coalesce(jsonb_agg(jsonb_build_object(
           'old_status', l.old_status, 'new_status', l.new_status,
           'created_at', l.created_at) order by l.created_at), '[]'::jsonb)
    into timeline
  from application_status_log l where l.application_id = a.id;

  select case when o.status in ('sent','accepted','declined') then
           jsonb_build_object(
             'status', o.status, 'position', o.position,
             'employment_type', o.employment_type, 'compensation', o.compensation,
             'start_date', o.start_date, 'terms', o.terms, 'disclaimer', o.disclaimer,
             'sent_at', o.sent_at, 'responded_at', o.responded_at)
         else null end
    into offer
  from offers o where o.application_id = a.id;

  if a.status in ('shortlisted', 'hired') then
    select jsonb_strip_nulls(jsonb_build_object(
      'whatsapp', case
        when ep.contact_whatsapp is not null
         and regexp_replace(ep.contact_whatsapp, '\D', '', 'g') <>
             regexp_replace(coalesce(a.whatsapp, ''), '\D', '', 'g')
          then ep.contact_whatsapp
        else null
      end,
      'email', case
        when ep.contact_email is not null
         and lower(ep.contact_email) <> lower(coalesce(a.email, ''))
          then ep.contact_email
        else null
      end
    ))
    into employer_contact
    from employer_profiles ep
    where ep.id = v.employer_id;

    if employer_contact = '{}'::jsonb then employer_contact := null; end if;
  end if;

  return jsonb_build_object(
    'status', a.status,
    'full_name', a.full_name,
    'created_at', a.created_at,
    'vacancy', jsonb_build_object(
      'title', v.title, 'company_name', v.company_name,
      'location', v.location, 'slug', v.slug),
    'employer_contact', employer_contact,
    'offer', offer,
    'timeline', timeline
  );
end; $$;

grant execute on function get_application_status(text) to anon, authenticated;
