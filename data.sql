-- Oppretter brukertabell med grunnleggende brukerinformasjon
CREATE TABLE bruker (
    bruker_id SERIAL PRIMARY KEY,  -- Unik ID for hver bruker, auto-inkrementerende
    fornavn VARCHAR(50) NOT NULL,   -- Brukerens fornavn, må fylles ut
    etternavn VARCHAR(50) NOT NULL, -- Brukerens etternavn, må fylles ut
    alder INT CHECK (alder >= 16),  -- Brukerens alder, må være 16 eller eldre
    epost VARCHAR(100) UNIQUE NOT NULL, -- Unik e-postadresse for hver bruker
    passord_hash VARCHAR(255) NOT NULL  -- Hashet passord for sikkerhet
);

-- Oppretter gruppetabell for treningsgrupper
CREATE TABLE gruppe (
    gruppe_id SERIAL PRIMARY KEY,        -- Unik ID for hver gruppe
    navn VARCHAR(100) NOT NULL,          -- Gruppens navn
    beskrivelse TEXT,                    -- Valgfri beskrivelse av gruppen
    gruppenokkel VARCHAR(20) UNIQUE NOT NULL -- Unik nøkkel for å bli med i gruppen
);

-- Koblingstabell mellom brukere og grupper (mange-til-mange relasjon)
CREATE TABLE brukergruppe (
    bruker_id INT REFERENCES bruker(bruker_id), -- Referanse til bruker
    gruppe_id INT REFERENCES gruppe(gruppe_id),  -- Referanse til gruppe
    PRIMARY KEY (bruker_id, gruppe_id)          -- Sammensatt primærnøkkel
);

-- Tabell for treningsøkter
CREATE TABLE treningsokt (
    okt_id SERIAL PRIMARY KEY,           -- Unik ID for hver treningsøkt
    gruppe_id INT REFERENCES gruppe(gruppe_id), -- Hvilken gruppe økten tilhører
    bruker_id INT REFERENCES bruker(bruker_id), -- Hvilken bruker som utførte økten
    type VARCHAR(50) NOT NULL,           -- Type trening (f.eks. løping, styrke)
    varighet_minutter INT NOT NULL,      -- Øktens varighet i minutter
    dato DATE NOT NULL,                  -- Dato for økten
    beskrivelse TEXT                     -- Valgfri beskrivelse av økten
);

-- Legger inn eksempelbrukere
INSERT INTO bruker (fornavn, etternavn, alder, epost, passord_hash) VALUES
    ('Ole', 'Hansen', 25, 'ole.hansen@example.com', 'hash1234'),
    ('Kari', 'Olsen', 30, 'kari.olsen@example.com', 'hash5678'),
    ('Per', 'Nilsen', 28, 'per.nilsen@example.com', 'hash9012');

-- Legger inn eksempelgrupper
INSERT INTO gruppe (navn, beskrivelse, gruppenokkel) VALUES
    ('Morgentrim', 'Gruppe for morgenfugler', 'MORG123'),
    ('Joggegruppa', 'Vi jogger sammen hver uke', 'JOGG456'),
    ('Styrketrening', 'Fokus på styrkeøvelser', 'STYR789');

-- Kobler brukere til grupper
INSERT INTO brukergruppe (bruker_id, gruppe_id) VALUES
    (1, 1), -- Ole er med i Morgentrim
    (1, 2), -- Ole er med i Joggegruppa
    (2, 2), -- Kari er med i Joggegruppa
    (3, 3); -- Per er med i Styrketrening

-- Legger inn eksempel-treningsøkter
INSERT INTO treningsokt (gruppe_id, bruker_id, type, varighet_minutter, dato, beskrivelse) VALUES
    (1, 1, 'Yoga', 45, '2024-03-10', 'Morgen yoga økt'),
    (2, 1, 'Jogging', 30, '2024-03-11', '5km joggetur'),
    (2, 2, 'Jogging', 40, '2024-03-11', '6km joggetur'),
    (3, 3, 'Vekttrening', 60, '2024-03-12', 'Fokus på overkropp');