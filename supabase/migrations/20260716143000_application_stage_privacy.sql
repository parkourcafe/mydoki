-- Sensitive identity and health records are collected only after an offer.
-- Remove them from existing open vacancy forms without touching documents
-- already attached to historical applications.
update vacancies as v
set required_documents = coalesce(
  (
    select jsonb_agg(doc order by ord)
    from jsonb_array_elements(coalesce(v.required_documents, '[]'::jsonb))
      with ordinality as item(doc, ord)
    where coalesce(lower(doc ->> 'type'), '') not in ('ktp', 'health_cert')
      and coalesce(lower(doc ->> 'label'), '') !~
        '(ktp|identity|id card|passport|paspor|health|medical|surat sehat|удостовер|паспорт|медсправ|здоров)'
  ),
  '[]'::jsonb
),
updated_at = now()
where v.status in ('active', 'paused');
