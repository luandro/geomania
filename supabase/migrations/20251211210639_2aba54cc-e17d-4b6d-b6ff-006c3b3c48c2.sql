-- Create countries table
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  capital TEXT NOT NULL,
  flag_url TEXT NOT NULL,
  population BIGINT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz_sessions table to track user sessions
CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_mode TEXT NOT NULL CHECK (game_mode IN ('flag', 'capital', 'population')),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  questions_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Countries should be publicly readable (it's reference data)
CREATE POLICY "Countries are publicly readable"
ON public.countries
FOR SELECT
USING (true);

-- Quiz sessions are publicly readable and insertable (no auth required for fun game)
CREATE POLICY "Quiz sessions are publicly readable"
ON public.quiz_sessions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create quiz sessions"
ON public.quiz_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update quiz sessions"
ON public.quiz_sessions
FOR UPDATE
USING (true);

-- Insert countries data with real flag URLs and accurate data
INSERT INTO public.countries (name, capital, flag_url, population, region) VALUES
('Afghanistan', 'Kabul', 'https://flagcdn.com/w320/af.png', 38928346, 'Asia'),
('Albania', 'Tirana', 'https://flagcdn.com/w320/al.png', 2877797, 'Europe'),
('Algeria', 'Algiers', 'https://flagcdn.com/w320/dz.png', 43851044, 'Africa'),
('Argentina', 'Buenos Aires', 'https://flagcdn.com/w320/ar.png', 45195774, 'South America'),
('Australia', 'Canberra', 'https://flagcdn.com/w320/au.png', 25499884, 'Oceania'),
('Austria', 'Vienna', 'https://flagcdn.com/w320/at.png', 9006398, 'Europe'),
('Bangladesh', 'Dhaka', 'https://flagcdn.com/w320/bd.png', 164689383, 'Asia'),
('Belgium', 'Brussels', 'https://flagcdn.com/w320/be.png', 11589623, 'Europe'),
('Brazil', 'Brasília', 'https://flagcdn.com/w320/br.png', 212559417, 'South America'),
('Canada', 'Ottawa', 'https://flagcdn.com/w320/ca.png', 37742154, 'North America'),
('Chile', 'Santiago', 'https://flagcdn.com/w320/cl.png', 19116201, 'South America'),
('China', 'Beijing', 'https://flagcdn.com/w320/cn.png', 1439323776, 'Asia'),
('Colombia', 'Bogotá', 'https://flagcdn.com/w320/co.png', 50882891, 'South America'),
('Croatia', 'Zagreb', 'https://flagcdn.com/w320/hr.png', 4105267, 'Europe'),
('Cuba', 'Havana', 'https://flagcdn.com/w320/cu.png', 11326616, 'North America'),
('Czech Republic', 'Prague', 'https://flagcdn.com/w320/cz.png', 10708981, 'Europe'),
('Denmark', 'Copenhagen', 'https://flagcdn.com/w320/dk.png', 5792202, 'Europe'),
('Egypt', 'Cairo', 'https://flagcdn.com/w320/eg.png', 102334404, 'Africa'),
('Ethiopia', 'Addis Ababa', 'https://flagcdn.com/w320/et.png', 114963588, 'Africa'),
('Finland', 'Helsinki', 'https://flagcdn.com/w320/fi.png', 5540720, 'Europe'),
('France', 'Paris', 'https://flagcdn.com/w320/fr.png', 65273511, 'Europe'),
('Germany', 'Berlin', 'https://flagcdn.com/w320/de.png', 83783942, 'Europe'),
('Ghana', 'Accra', 'https://flagcdn.com/w320/gh.png', 31072940, 'Africa'),
('Greece', 'Athens', 'https://flagcdn.com/w320/gr.png', 10423054, 'Europe'),
('Hungary', 'Budapest', 'https://flagcdn.com/w320/hu.png', 9660351, 'Europe'),
('Iceland', 'Reykjavik', 'https://flagcdn.com/w320/is.png', 341243, 'Europe'),
('India', 'New Delhi', 'https://flagcdn.com/w320/in.png', 1380004385, 'Asia'),
('Indonesia', 'Jakarta', 'https://flagcdn.com/w320/id.png', 273523615, 'Asia'),
('Iran', 'Tehran', 'https://flagcdn.com/w320/ir.png', 83992949, 'Asia'),
('Iraq', 'Baghdad', 'https://flagcdn.com/w320/iq.png', 40222493, 'Asia'),
('Ireland', 'Dublin', 'https://flagcdn.com/w320/ie.png', 4937786, 'Europe'),
('Israel', 'Jerusalem', 'https://flagcdn.com/w320/il.png', 8655535, 'Asia'),
('Italy', 'Rome', 'https://flagcdn.com/w320/it.png', 60461826, 'Europe'),
('Jamaica', 'Kingston', 'https://flagcdn.com/w320/jm.png', 2961167, 'North America'),
('Japan', 'Tokyo', 'https://flagcdn.com/w320/jp.png', 126476461, 'Asia'),
('Jordan', 'Amman', 'https://flagcdn.com/w320/jo.png', 10203134, 'Asia'),
('Kazakhstan', 'Nur-Sultan', 'https://flagcdn.com/w320/kz.png', 18776707, 'Asia'),
('Kenya', 'Nairobi', 'https://flagcdn.com/w320/ke.png', 53771296, 'Africa'),
('Malaysia', 'Kuala Lumpur', 'https://flagcdn.com/w320/my.png', 32365999, 'Asia'),
('Mexico', 'Mexico City', 'https://flagcdn.com/w320/mx.png', 128932753, 'North America'),
('Morocco', 'Rabat', 'https://flagcdn.com/w320/ma.png', 36910560, 'Africa'),
('Nepal', 'Kathmandu', 'https://flagcdn.com/w320/np.png', 29136808, 'Asia'),
('Netherlands', 'Amsterdam', 'https://flagcdn.com/w320/nl.png', 17134872, 'Europe'),
('New Zealand', 'Wellington', 'https://flagcdn.com/w320/nz.png', 4822233, 'Oceania'),
('Nigeria', 'Abuja', 'https://flagcdn.com/w320/ng.png', 206139589, 'Africa'),
('Norway', 'Oslo', 'https://flagcdn.com/w320/no.png', 5421241, 'Europe'),
('Pakistan', 'Islamabad', 'https://flagcdn.com/w320/pk.png', 220892340, 'Asia'),
('Peru', 'Lima', 'https://flagcdn.com/w320/pe.png', 32971854, 'South America'),
('Philippines', 'Manila', 'https://flagcdn.com/w320/ph.png', 109581078, 'Asia'),
('Poland', 'Warsaw', 'https://flagcdn.com/w320/pl.png', 37846611, 'Europe'),
('Portugal', 'Lisbon', 'https://flagcdn.com/w320/pt.png', 10196709, 'Europe'),
('Romania', 'Bucharest', 'https://flagcdn.com/w320/ro.png', 19237691, 'Europe'),
('Russia', 'Moscow', 'https://flagcdn.com/w320/ru.png', 145934462, 'Europe'),
('Saudi Arabia', 'Riyadh', 'https://flagcdn.com/w320/sa.png', 34813871, 'Asia'),
('Singapore', 'Singapore', 'https://flagcdn.com/w320/sg.png', 5850342, 'Asia'),
('South Africa', 'Pretoria', 'https://flagcdn.com/w320/za.png', 59308690, 'Africa'),
('South Korea', 'Seoul', 'https://flagcdn.com/w320/kr.png', 51269185, 'Asia'),
('Spain', 'Madrid', 'https://flagcdn.com/w320/es.png', 46754778, 'Europe'),
('Sri Lanka', 'Sri Jayawardenepura Kotte', 'https://flagcdn.com/w320/lk.png', 21413249, 'Asia'),
('Sweden', 'Stockholm', 'https://flagcdn.com/w320/se.png', 10099265, 'Europe'),
('Switzerland', 'Bern', 'https://flagcdn.com/w320/ch.png', 8654622, 'Europe'),
('Thailand', 'Bangkok', 'https://flagcdn.com/w320/th.png', 69799978, 'Asia'),
('Turkey', 'Ankara', 'https://flagcdn.com/w320/tr.png', 84339067, 'Asia'),
('Ukraine', 'Kyiv', 'https://flagcdn.com/w320/ua.png', 43733762, 'Europe'),
('United Arab Emirates', 'Abu Dhabi', 'https://flagcdn.com/w320/ae.png', 9890402, 'Asia'),
('United Kingdom', 'London', 'https://flagcdn.com/w320/gb.png', 67886011, 'Europe'),
('United States', 'Washington, D.C.', 'https://flagcdn.com/w320/us.png', 331002651, 'North America'),
('Venezuela', 'Caracas', 'https://flagcdn.com/w320/ve.png', 28435940, 'South America'),
('Vietnam', 'Hanoi', 'https://flagcdn.com/w320/vn.png', 97338579, 'Asia');