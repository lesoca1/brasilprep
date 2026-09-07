-- DEVELOPMENT ONLY. Catalog examples, not a verified admissions catalog.
-- No users, passwords, performance data or invented cutoffs are seeded.
begin;
insert into public.exams(id,name,is_development) values
 ('fuvest','FUVEST',true),('unicamp','UNICAMP',true),('unesp','UNESP',true),
 ('fgv','FGV',true),('insper','Insper',true),('ita','ITA',true),('ime','IME',true),('enem','ENEM',true)
on conflict(id) do nothing;
insert into public.institutions(id,name,abbreviation,is_development) values
 ('usp','Universidade de São Paulo','USP',true),('unicamp','Universidade Estadual de Campinas','UNICAMP',true),
 ('unesp','Universidade Estadual Paulista','UNESP',true),('fgv','Fundação Getulio Vargas','FGV',true),
 ('insper','Insper Instituto de Ensino e Pesquisa','Insper',true),('ita','Instituto Tecnológico de Aeronáutica','ITA',true),
 ('ime','Instituto Militar de Engenharia','IME',true)
on conflict(id) do nothing;
insert into public.courses(id,institution_id,name,campus,modality,is_development) values
 ('usp-economia-sp','usp','Ciências Econômicas','FEA · São Paulo','Presencial',true),
 ('usp-administracao-sp','usp','Administração','FEA · São Paulo','Presencial',true),
 ('unicamp-economia','unicamp','Ciências Econômicas','Campinas','Presencial',true),
 ('unesp-economia','unesp','Ciências Econômicas','Araraquara','Presencial',true),
 ('fgv-economia','fgv','Economia','EESP · São Paulo','Presencial',true),
 ('insper-economia','insper','Ciências Econômicas','São Paulo','Presencial',true),
 ('ita-engenharia','ita','Engenharia Aeronáutica','São José dos Campos','Presencial',true),
 ('ime-engenharia','ime','Engenharia de Computação','Rio de Janeiro','Presencial',true)
on conflict(id) do nothing;
insert into public.admission_targets(id,exam_id,course_id,admission_year,competition_category,phase,is_development) values
 ('00000000-0000-4000-8000-000000000001','fuvest','usp-economia-sp',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000002','fuvest','usp-administracao-sp',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000003','unicamp','unicamp-economia',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000004','unesp','unesp-economia',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000005','fgv','fgv-economia',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000006','insper','insper-economia',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000007','ita','ita-engenharia',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true),
 ('00000000-0000-4000-8000-000000000008','ime','ime-engenharia',2027,'Exemplo: ampla concorrência','Seleção de objetivo',true)
on conflict(id) do nothing;
-- ENEM deliberately has no target until an admission path is verified/configured.
commit;
