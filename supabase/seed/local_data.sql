SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict HYdFaWYaM4R785Yj8v9a7MnZdVsYfSNaURPZXVsOumjVyksSiMfjjaY66eTvkp3

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'bec3ca34-f355-4d75-8f38-3d87a356b624', '{"action":"user_signedup","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-12 21:12:21.050734+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b54a82d-ce9b-4a8f-b542-14c125abeb3c', '{"action":"login","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 21:12:21.058681+00', ''),
	('00000000-0000-0000-0000-000000000000', '8db64026-b938-45a5-a602-eef2577890d5', '{"action":"login","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 21:13:19.837128+00', ''),
	('00000000-0000-0000-0000-000000000000', '5eb05878-3049-497b-9f78-7049ca372fd8', '{"action":"token_refreshed","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-12 22:11:28.100553+00', ''),
	('00000000-0000-0000-0000-000000000000', '2581e40e-9ba8-4cfb-b44a-53b38dc385dc', '{"action":"token_revoked","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-12 22:11:28.104868+00', ''),
	('00000000-0000-0000-0000-000000000000', '81bd3122-e548-46ae-a293-464c5ccd80b0', '{"action":"token_refreshed","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-12 22:11:51.097446+00', ''),
	('00000000-0000-0000-0000-000000000000', '3956591d-1ed4-4983-812e-68b24cf65d19', '{"action":"logout","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-12 22:11:56.926065+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4e6a14e-b8ad-4188-9e0f-eb878adf471f', '{"action":"user_signedup","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-12 22:27:40.972261+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd679e71f-7e10-4a7a-930c-0e3e78822c0d', '{"action":"login","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:27:40.978678+00', ''),
	('00000000-0000-0000-0000-000000000000', '8db1af25-52ce-43dd-9e2b-b843ca84092c', '{"action":"login","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:28:07.256487+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db016378-9673-4f7d-b68d-8ea670ee3e72', '{"action":"login","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:28:45.498147+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ee18075-3dd6-49c6-bbaf-5364bf5b73ed', '{"action":"logout","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-12 22:31:32.810882+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3d5355b-96bf-4ade-b98e-20071ee41379', '{"action":"login","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:31:42.037288+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1299f2b-cb8c-4085-933e-5e3d74fd214c', '{"action":"logout","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-12 22:32:24.560287+00', ''),
	('00000000-0000-0000-0000-000000000000', '16cde320-3db4-490f-bc88-fbd5d5d877c7', '{"action":"user_signedup","actor_id":"8d989149-cf73-446b-9cca-bb6e9f9c666c","actor_username":"testowy_organizator@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-12 22:33:12.305442+00', ''),
	('00000000-0000-0000-0000-000000000000', '94f4fefd-b4c7-40ac-98be-a912aabed561', '{"action":"login","actor_id":"8d989149-cf73-446b-9cca-bb6e9f9c666c","actor_username":"testowy_organizator@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:33:12.310575+00', ''),
	('00000000-0000-0000-0000-000000000000', '938943fb-1d61-446c-ab76-84316174900e', '{"action":"login","actor_id":"8d989149-cf73-446b-9cca-bb6e9f9c666c","actor_username":"testowy_organizator@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:33:42.032991+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ca069df7-9786-4e56-aee5-4dd3ed12aba1', '{"action":"login","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-12 22:34:03.219413+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c53d01ea-dea6-474f-bd00-ade39edbbbb4', '{"action":"logout","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-12 23:13:23.391625+00', ''),
	('00000000-0000-0000-0000-000000000000', '14a1dbe4-5c5b-416b-b820-05847adfad50', '{"action":"login","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 09:35:53.542345+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5a8ffdf-c859-4c51-8c9a-756fd7dd5779', '{"action":"logout","actor_id":"f77073cb-742f-4051-a4f7-3f5d41471f8b","actor_username":"testowy_zawodnik@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-13 09:36:23.450145+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de8d9d89-4dac-46a0-8f9c-71bb803e266c', '{"action":"user_signedup","actor_id":"0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81","actor_username":"testuser_1763043495351@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:18:20.485754+00', ''),
	('00000000-0000-0000-0000-000000000000', '3dc260df-9a74-487f-a8a8-6857fa0ccd94', '{"action":"user_signedup","actor_id":"65130e9a-8230-4569-a767-51b1712935e9","actor_username":"testuser_1763043498600@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:18:20.485896+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3ecd96e-3fff-49b4-9fd7-104109fe48d6', '{"action":"login","actor_id":"0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81","actor_username":"testuser_1763043495351@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:18:20.495681+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd630682-ba6c-4823-80b9-1ac2193c7d00', '{"action":"login","actor_id":"65130e9a-8230-4569-a767-51b1712935e9","actor_username":"testuser_1763043498600@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:18:20.497385+00', ''),
	('00000000-0000-0000-0000-000000000000', '94c9a70d-1bef-44d4-8726-88c4f452c884', '{"action":"user_signedup","actor_id":"1a4e0f72-80e9-483d-99ba-adc8767306a6","actor_username":"testuser_1763043546295@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:19:10.030649+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e88a7e91-c033-495e-bae6-1ef055a1fb02', '{"action":"login","actor_id":"1a4e0f72-80e9-483d-99ba-adc8767306a6","actor_username":"testuser_1763043546295@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:19:10.050334+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c40c9c79-07ae-431c-8462-a776a0f3158f', '{"action":"user_signedup","actor_id":"d4089e35-16b6-46a6-8bf7-1a7d2270fc17","actor_username":"testuser_1763043548959@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:19:10.652249+00', ''),
	('00000000-0000-0000-0000-000000000000', '3f550d3b-f4eb-41bb-a62b-780a0a3634a0', '{"action":"login","actor_id":"d4089e35-16b6-46a6-8bf7-1a7d2270fc17","actor_username":"testuser_1763043548959@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:19:10.662993+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4b6dc64-dded-4aa5-9f5d-5db7f0861816', '{"action":"user_signedup","actor_id":"26fc07d9-e1ed-47d6-abc2-e6f202892805","actor_username":"testuser_1763043745849@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:22:30.199576+00', ''),
	('00000000-0000-0000-0000-000000000000', '08a8520a-c7b4-42c5-8a7e-49ab9f505dfe', '{"action":"login","actor_id":"26fc07d9-e1ed-47d6-abc2-e6f202892805","actor_username":"testuser_1763043745849@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:22:30.208475+00', ''),
	('00000000-0000-0000-0000-000000000000', '46ec0465-d41a-441f-b9ad-111032888603', '{"action":"user_signedup","actor_id":"4014f048-b414-428f-ac3b-9bec334fba40","actor_username":"testuser_1763043749046@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:22:30.558904+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a69e379-57c7-437b-a5e7-22993c1e170a', '{"action":"login","actor_id":"4014f048-b414-428f-ac3b-9bec334fba40","actor_username":"testuser_1763043749046@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:22:30.564078+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f3f87051-dd43-4582-abc9-a4138bc02495', '{"action":"user_signedup","actor_id":"5d0a1a68-74c4-418d-be68-f4bdb6f41874","actor_username":"testuser_1763043889318@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:24:53.608449+00', ''),
	('00000000-0000-0000-0000-000000000000', '833f2f3b-c0a7-45f3-bf92-faaeff9d324f', '{"action":"login","actor_id":"5d0a1a68-74c4-418d-be68-f4bdb6f41874","actor_username":"testuser_1763043889318@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:24:53.61508+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e36c27b-2232-431f-bd25-9bac7471f307', '{"action":"user_signedup","actor_id":"3e3f9c10-d3b6-4225-bc71-8a857381ca3f","actor_username":"testuser_1763043892378@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:24:54.133785+00', ''),
	('00000000-0000-0000-0000-000000000000', '6bbd8701-7c91-48f7-807d-773285143eaa', '{"action":"login","actor_id":"3e3f9c10-d3b6-4225-bc71-8a857381ca3f","actor_username":"testuser_1763043892378@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:24:54.140509+00', ''),
	('00000000-0000-0000-0000-000000000000', '279512c9-cad6-4dcc-9dbf-df17a91e72a6', '{"action":"user_signedup","actor_id":"6dc74202-d23a-4c93-8411-31b9101bd84f","actor_username":"testuser_1763044007621@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:26:49.408961+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1739c08-ab84-4a6a-9ac2-93eebff52788', '{"action":"login","actor_id":"6dc74202-d23a-4c93-8411-31b9101bd84f","actor_username":"testuser_1763044007621@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:26:49.415534+00', ''),
	('00000000-0000-0000-0000-000000000000', '7dea5c3c-46c3-43fc-897c-964bc8d3d65f', '{"action":"user_signedup","actor_id":"5347bb1a-1694-492c-bafa-c5c18c525835","actor_username":"testuser_1763044005023@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:26:49.437567+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab2a1add-6f58-41fc-8c24-f83e5a8e93c0', '{"action":"login","actor_id":"5347bb1a-1694-492c-bafa-c5c18c525835","actor_username":"testuser_1763044005023@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:26:49.44273+00', ''),
	('00000000-0000-0000-0000-000000000000', '2259f93b-00bd-4c60-aa1d-f458e2d53f83', '{"action":"user_signedup","actor_id":"59a860cf-1ee6-45ad-9791-1af10bef6950","actor_username":"testuser_1763044105974@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:28:30.518421+00', ''),
	('00000000-0000-0000-0000-000000000000', '4723c296-856c-4bec-8c79-150316782b11', '{"action":"login","actor_id":"59a860cf-1ee6-45ad-9791-1af10bef6950","actor_username":"testuser_1763044105974@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:28:30.525371+00', ''),
	('00000000-0000-0000-0000-000000000000', '593bda5e-e75c-4dac-8c8b-f78705b4a6a3', '{"action":"user_signedup","actor_id":"7b7db572-8c78-400a-b7d6-1bed550920b7","actor_username":"testuser_1763044109158@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:28:30.84785+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c241b63-a8a7-4f66-ae04-8f653837bd22', '{"action":"login","actor_id":"7b7db572-8c78-400a-b7d6-1bed550920b7","actor_username":"testuser_1763044109158@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:28:30.859758+00', ''),
	('00000000-0000-0000-0000-000000000000', '897d0746-19ac-4fe5-9459-e409fcb7959f', '{"action":"user_signedup","actor_id":"4e1bb2a5-d38e-4dea-9f8b-e269459cfe07","actor_username":"testuser_1763044232741@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:30:36.557675+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd542395a-2f6e-4e19-a535-7ae719c298b6', '{"action":"login","actor_id":"4e1bb2a5-d38e-4dea-9f8b-e269459cfe07","actor_username":"testuser_1763044232741@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:30:36.572563+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e275297b-7bdb-4b72-8cd5-7c1d26d19ac2', '{"action":"user_signedup","actor_id":"ce221240-a20f-4cb6-bce9-f68e74b95522","actor_username":"testuser_1763044319822@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-13 14:32:03.96021+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad0af3a5-69ec-4a48-b3af-51e1d6d40c49', '{"action":"login","actor_id":"ce221240-a20f-4cb6-bce9-f68e74b95522","actor_username":"testuser_1763044319822@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:32:03.965959+00', ''),
	('00000000-0000-0000-0000-000000000000', '8284bf4c-0bec-484c-8e75-39f98b9200e3', '{"action":"login","actor_id":"8d989149-cf73-446b-9cca-bb6e9f9c666c","actor_username":"testowy_organizator@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-13 14:37:00.887284+00', ''),
	('00000000-0000-0000-0000-000000000000', '38d62eaa-c33f-41ed-a7c7-039bea5bd572', '{"action":"logout","actor_id":"8d989149-cf73-446b-9cca-bb6e9f9c666c","actor_username":"testowy_organizator@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-13 14:37:11.960864+00', ''),
	('00000000-0000-0000-0000-000000000000', 'be77580c-e0d3-4d3d-aac5-8e6c73eb7d08', '{"action":"login","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-14 16:46:06.865034+00', ''),
	('00000000-0000-0000-0000-000000000000', '20882516-8e87-49b2-8423-e5a339753d1d', '{"action":"token_refreshed","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-14 17:44:34.771444+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e1238ee-39e4-4faa-8bdf-cd26fe7c9135', '{"action":"token_revoked","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-14 17:44:34.773569+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e40f3417-6a0d-410f-9e93-5276d00fc9cf', '{"action":"token_refreshed","actor_id":"601f8b1c-9c9c-492b-89ee-2f60ae0d562d","actor_username":"yegomejl@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-14 17:44:53.916437+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '65130e9a-8230-4569-a767-51b1712935e9', 'authenticated', 'authenticated', 'testuser_1763043498600@example.com', '$2a$10$zf0.jEhpBafjGWGvR04ime6OQXkT6wJKDytUfHdDczq9sbw8vG7Im', '2025-11-13 14:18:20.4867+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:18:20.498385+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "65130e9a-8230-4569-a767-51b1712935e9", "email": "testuser_1763043498600@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:18:20.442163+00', '2025-11-13 14:18:20.504617+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5d0a1a68-74c4-418d-be68-f4bdb6f41874', 'authenticated', 'authenticated', 'testuser_1763043889318@example.com', '$2a$10$w93SMk2JWmEaWnmMLtFd3uvVQLxdx3cwCKOiz6GL12oQjRkk63TRG', '2025-11-13 14:24:53.609536+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:24:53.616206+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5d0a1a68-74c4-418d-be68-f4bdb6f41874", "email": "testuser_1763043889318@example.com", "position": "midfielder", "last_name": "Kowalski9318", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:24:53.596741+00', '2025-11-13 14:24:53.61953+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8d989149-cf73-446b-9cca-bb6e9f9c666c', 'authenticated', 'authenticated', 'testowy_organizator@gmail.com', '$2a$10$V0thCu2CHSV9l2g6pXcxhOOW.1FTwFhUTdXwJQDkWXHjeMkvS67ti', '2025-11-12 22:33:12.306022+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:37:00.888263+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "8d989149-cf73-446b-9cca-bb6e9f9c666c", "email": "testowy_organizator@gmail.com", "position": "goalkeeper", "last_name": "Organizator", "first_name": "Organizator", "email_verified": true, "phone_verified": false}', NULL, '2025-11-12 22:33:12.298878+00', '2025-11-13 14:37:00.891005+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '26fc07d9-e1ed-47d6-abc2-e6f202892805', 'authenticated', 'authenticated', 'testuser_1763043745849@example.com', '$2a$10$JvI2nMtelYNmCaA1P0alXeVNlS4N6Q56Khv8GIWzcy/vKA26EjadS', '2025-11-13 14:22:30.201115+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:22:30.212016+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "26fc07d9-e1ed-47d6-abc2-e6f202892805", "email": "testuser_1763043745849@example.com", "position": "midfielder", "last_name": "Kowalski5849", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:22:30.156653+00', '2025-11-13 14:22:30.21863+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1a4e0f72-80e9-483d-99ba-adc8767306a6', 'authenticated', 'authenticated', 'testuser_1763043546295@example.com', '$2a$10$v/SFyBRmsp9/EP4JJ/X00ucbNq2EcFeOIVOocXTkghWGL.LMXDSd.', '2025-11-13 14:19:10.031975+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:19:10.051327+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "1a4e0f72-80e9-483d-99ba-adc8767306a6", "email": "testuser_1763043546295@example.com", "position": "midfielder", "last_name": "Kowalski6295", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:19:10.01316+00', '2025-11-13 14:19:10.059164+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd4089e35-16b6-46a6-8bf7-1a7d2270fc17', 'authenticated', 'authenticated', 'testuser_1763043548959@example.com', '$2a$10$BNXdV4vcFYKH8INTebMdYOLMmOuyaW2HNVGWOMcK5oQVnlly.o/jG', '2025-11-13 14:19:10.65324+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:19:10.664135+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d4089e35-16b6-46a6-8bf7-1a7d2270fc17", "email": "testuser_1763043548959@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:19:10.6347+00', '2025-11-13 14:19:10.666847+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f77073cb-742f-4051-a4f7-3f5d41471f8b', 'authenticated', 'authenticated', 'testowy_zawodnik@gmail.com', '$2a$10$b8e20c9Q.kAP1wKU2Pp5F.hshhmP9bG/wJEuoNY3nvLuFZZ/kyJZ2', '2025-11-12 22:27:40.973136+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 09:35:53.547093+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f77073cb-742f-4051-a4f7-3f5d41471f8b", "email": "testowy_zawodnik@gmail.com", "position": "goalkeeper", "last_name": "Zawodnik", "first_name": "Zawodnik", "email_verified": true, "phone_verified": false}', NULL, '2025-11-12 22:27:40.962074+00', '2025-11-13 09:35:53.55704+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81', 'authenticated', 'authenticated', 'testuser_1763043495351@example.com', '$2a$10$QWxI9amjWZmHf49Gex8KDOq6B9U1VIdYBN1oVuPSEeI1n0QjhEM1O', '2025-11-13 14:18:20.486687+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:18:20.497906+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81", "email": "testuser_1763043495351@example.com", "position": "midfielder", "last_name": "Kowalski5351", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:18:20.443058+00', '2025-11-13 14:18:20.503723+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '601f8b1c-9c9c-492b-89ee-2f60ae0d562d', 'authenticated', 'authenticated', 'yegomejl@gmail.com', '$2a$10$z61ld9FE0W0pNMx0gXymrO2u6/8/9MukYiXZkJFQvTExVfRz9ivVK', '2025-11-12 21:12:21.052416+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-14 16:46:06.873124+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "601f8b1c-9c9c-492b-89ee-2f60ae0d562d", "email": "yegomejl@gmail.com", "position": "goalkeeper", "last_name": "Tobiaszowski", "first_name": "Tobiasz", "email_verified": true, "phone_verified": false}', NULL, '2025-11-12 21:12:21.036317+00', '2025-11-14 17:44:34.777726+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4014f048-b414-428f-ac3b-9bec334fba40', 'authenticated', 'authenticated', 'testuser_1763043749046@example.com', '$2a$10$hdpPDlYo.Ejn//4tOgPaAOv0TQy6TgFnpV/aNFAZQbRMsbziI1Tte', '2025-11-13 14:22:30.559645+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:22:30.565072+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4014f048-b414-428f-ac3b-9bec334fba40", "email": "testuser_1763043749046@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:22:30.553942+00', '2025-11-13 14:22:30.566989+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3e3f9c10-d3b6-4225-bc71-8a857381ca3f', 'authenticated', 'authenticated', 'testuser_1763043892378@example.com', '$2a$10$lhzzlizqVbDo9s/7y0KjmegkpTQRlL7y2ldChGuPf30.b/hDQuAIW', '2025-11-13 14:24:54.134784+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:24:54.141463+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3e3f9c10-d3b6-4225-bc71-8a857381ca3f", "email": "testuser_1763043892378@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:24:54.125637+00', '2025-11-13 14:24:54.143489+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7b7db572-8c78-400a-b7d6-1bed550920b7', 'authenticated', 'authenticated', 'testuser_1763044109158@example.com', '$2a$10$TZyk0NgRTmDYrWAP7PD4aeQ5DIFg6nkj/4mAzE53jOaPtMclnRZGa', '2025-11-13 14:28:30.848742+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:28:30.86089+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "7b7db572-8c78-400a-b7d6-1bed550920b7", "email": "testuser_1763044109158@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:28:30.840835+00', '2025-11-13 14:28:30.864588+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6dc74202-d23a-4c93-8411-31b9101bd84f', 'authenticated', 'authenticated', 'testuser_1763044007621@example.com', '$2a$10$hI2v6enXKdPbgWSppXe6ZeKxiM9HZ8FVfEAJNZQfrzcvEfkIrUvRG', '2025-11-13 14:26:49.409739+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:26:49.417517+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6dc74202-d23a-4c93-8411-31b9101bd84f", "email": "testuser_1763044007621@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:26:49.398869+00', '2025-11-13 14:26:49.420697+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '59a860cf-1ee6-45ad-9791-1af10bef6950', 'authenticated', 'authenticated', 'testuser_1763044105974@example.com', '$2a$10$nCSAiyIYrpiBL5oQgEMQ0.PBgiQJj1qiFjtoPfSOVcWtAiyGQ7oTG', '2025-11-13 14:28:30.519159+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:28:30.526211+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "59a860cf-1ee6-45ad-9791-1af10bef6950", "email": "testuser_1763044105974@example.com", "position": "midfielder", "last_name": "Kowalski5974", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:28:30.51141+00', '2025-11-13 14:28:30.528068+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ce221240-a20f-4cb6-bce9-f68e74b95522', 'authenticated', 'authenticated', 'testuser_1763044319822@example.com', '$2a$10$5V7tZdwYoCYWfjf8Ath.tO2pQa4i09EanvcNW2b7v.2IOd7GLpasy', '2025-11-13 14:32:03.960937+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:32:03.967055+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "ce221240-a20f-4cb6-bce9-f68e74b95522", "email": "testuser_1763044319822@example.com", "position": "midfielder", "last_name": "Kowalski9822", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:32:03.953519+00', '2025-11-13 14:32:03.969707+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5347bb1a-1694-492c-bafa-c5c18c525835', 'authenticated', 'authenticated', 'testuser_1763044005023@example.com', '$2a$10$qD/gW6ZzlyCUkF8xNWgqnOwBMHjn1UZjYpi2PspNXTQx6RngKod8K', '2025-11-13 14:26:49.438451+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:26:49.443709+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5347bb1a-1694-492c-bafa-c5c18c525835", "email": "testuser_1763044005023@example.com", "position": "midfielder", "last_name": "Kowalski5023", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:26:49.431346+00', '2025-11-13 14:26:49.446517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4e1bb2a5-d38e-4dea-9f8b-e269459cfe07', 'authenticated', 'authenticated', 'testuser_1763044232741@example.com', '$2a$10$IGlEbKHcCrErdvxHdJM6wezgiH2C.ueTSaYSRd1y./mA80GKWowBK', '2025-11-13 14:30:36.55887+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-13 14:30:36.573728+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4e1bb2a5-d38e-4dea-9f8b-e269459cfe07", "email": "testuser_1763044232741@example.com", "position": "midfielder", "last_name": "Kowalski2741", "first_name": "Jan", "email_verified": true, "phone_verified": false}', NULL, '2025-11-13 14:30:36.538873+00', '2025-11-13 14:30:36.589078+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('601f8b1c-9c9c-492b-89ee-2f60ae0d562d', '601f8b1c-9c9c-492b-89ee-2f60ae0d562d', '{"sub": "601f8b1c-9c9c-492b-89ee-2f60ae0d562d", "email": "yegomejl@gmail.com", "position": "goalkeeper", "last_name": "Tobiaszowski", "first_name": "Tobiasz", "email_verified": false, "phone_verified": false}', 'email', '2025-11-12 21:12:21.044911+00', '2025-11-12 21:12:21.044975+00', '2025-11-12 21:12:21.044975+00', 'e57e4ba8-109f-4db6-860b-e2f25a237216'),
	('f77073cb-742f-4051-a4f7-3f5d41471f8b', 'f77073cb-742f-4051-a4f7-3f5d41471f8b', '{"sub": "f77073cb-742f-4051-a4f7-3f5d41471f8b", "email": "testowy_zawodnik@gmail.com", "position": "goalkeeper", "last_name": "Zawodnik", "first_name": "Zawodnik", "email_verified": false, "phone_verified": false}', 'email', '2025-11-12 22:27:40.968285+00', '2025-11-12 22:27:40.968336+00', '2025-11-12 22:27:40.968336+00', '2f32f0b3-548c-4f94-b0f2-21892e91f1be'),
	('8d989149-cf73-446b-9cca-bb6e9f9c666c', '8d989149-cf73-446b-9cca-bb6e9f9c666c', '{"sub": "8d989149-cf73-446b-9cca-bb6e9f9c666c", "email": "testowy_organizator@gmail.com", "position": "goalkeeper", "last_name": "Organizator", "first_name": "Organizator", "email_verified": false, "phone_verified": false}', 'email', '2025-11-12 22:33:12.302776+00', '2025-11-12 22:33:12.302805+00', '2025-11-12 22:33:12.302805+00', '3c2c33e1-5e79-4e78-820b-955508c56d07'),
	('65130e9a-8230-4569-a767-51b1712935e9', '65130e9a-8230-4569-a767-51b1712935e9', '{"sub": "65130e9a-8230-4569-a767-51b1712935e9", "email": "testuser_1763043498600@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:18:20.480633+00', '2025-11-13 14:18:20.480778+00', '2025-11-13 14:18:20.480778+00', '866ea706-a740-45ee-b863-0c7493274626'),
	('0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81', '0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81', '{"sub": "0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81", "email": "testuser_1763043495351@example.com", "position": "midfielder", "last_name": "Kowalski5351", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:18:20.480639+00', '2025-11-13 14:18:20.480789+00', '2025-11-13 14:18:20.480789+00', '0de0a311-6dcb-4999-b5a6-48b5c9f9c421'),
	('1a4e0f72-80e9-483d-99ba-adc8767306a6', '1a4e0f72-80e9-483d-99ba-adc8767306a6', '{"sub": "1a4e0f72-80e9-483d-99ba-adc8767306a6", "email": "testuser_1763043546295@example.com", "position": "midfielder", "last_name": "Kowalski6295", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:19:10.01972+00', '2025-11-13 14:19:10.019775+00', '2025-11-13 14:19:10.019775+00', 'a6e5d256-e718-43fe-a3c0-3ec5cec46eb8'),
	('d4089e35-16b6-46a6-8bf7-1a7d2270fc17', 'd4089e35-16b6-46a6-8bf7-1a7d2270fc17', '{"sub": "d4089e35-16b6-46a6-8bf7-1a7d2270fc17", "email": "testuser_1763043548959@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:19:10.648311+00', '2025-11-13 14:19:10.648419+00', '2025-11-13 14:19:10.648419+00', 'bc315c7d-b030-4fde-9cd9-7c3ea1b08c33'),
	('26fc07d9-e1ed-47d6-abc2-e6f202892805', '26fc07d9-e1ed-47d6-abc2-e6f202892805', '{"sub": "26fc07d9-e1ed-47d6-abc2-e6f202892805", "email": "testuser_1763043745849@example.com", "position": "midfielder", "last_name": "Kowalski5849", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:22:30.193919+00', '2025-11-13 14:22:30.194008+00', '2025-11-13 14:22:30.194008+00', '7787fac1-aa47-4a2c-b802-22fbb3efe2da'),
	('4014f048-b414-428f-ac3b-9bec334fba40', '4014f048-b414-428f-ac3b-9bec334fba40', '{"sub": "4014f048-b414-428f-ac3b-9bec334fba40", "email": "testuser_1763043749046@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:22:30.556595+00', '2025-11-13 14:22:30.556642+00', '2025-11-13 14:22:30.556642+00', '37d7e5a9-0800-4d92-839f-401423323ac2'),
	('5d0a1a68-74c4-418d-be68-f4bdb6f41874', '5d0a1a68-74c4-418d-be68-f4bdb6f41874', '{"sub": "5d0a1a68-74c4-418d-be68-f4bdb6f41874", "email": "testuser_1763043889318@example.com", "position": "midfielder", "last_name": "Kowalski9318", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:24:53.604487+00', '2025-11-13 14:24:53.604541+00', '2025-11-13 14:24:53.604541+00', '6bfcfe25-1407-498b-86f9-58873e3e4624'),
	('3e3f9c10-d3b6-4225-bc71-8a857381ca3f', '3e3f9c10-d3b6-4225-bc71-8a857381ca3f', '{"sub": "3e3f9c10-d3b6-4225-bc71-8a857381ca3f", "email": "testuser_1763043892378@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:24:54.129011+00', '2025-11-13 14:24:54.129054+00', '2025-11-13 14:24:54.129054+00', '83190679-8cf8-4caa-b5de-d18a88b8f4db'),
	('6dc74202-d23a-4c93-8411-31b9101bd84f', '6dc74202-d23a-4c93-8411-31b9101bd84f', '{"sub": "6dc74202-d23a-4c93-8411-31b9101bd84f", "email": "testuser_1763044007621@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:26:49.405384+00', '2025-11-13 14:26:49.405417+00', '2025-11-13 14:26:49.405417+00', 'c018e082-3512-4ee3-b83c-14541007fb92'),
	('5347bb1a-1694-492c-bafa-c5c18c525835', '5347bb1a-1694-492c-bafa-c5c18c525835', '{"sub": "5347bb1a-1694-492c-bafa-c5c18c525835", "email": "testuser_1763044005023@example.com", "position": "midfielder", "last_name": "Kowalski5023", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:26:49.434828+00', '2025-11-13 14:26:49.434878+00', '2025-11-13 14:26:49.434878+00', '3e9a722d-5213-456f-bc93-cb6aad53a3e3'),
	('59a860cf-1ee6-45ad-9791-1af10bef6950', '59a860cf-1ee6-45ad-9791-1af10bef6950', '{"sub": "59a860cf-1ee6-45ad-9791-1af10bef6950", "email": "testuser_1763044105974@example.com", "position": "midfielder", "last_name": "Kowalski5974", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:28:30.515517+00', '2025-11-13 14:28:30.515583+00', '2025-11-13 14:28:30.515583+00', '58ae256c-1a63-41ae-b908-47cac8c489ed'),
	('7b7db572-8c78-400a-b7d6-1bed550920b7', '7b7db572-8c78-400a-b7d6-1bed550920b7', '{"sub": "7b7db572-8c78-400a-b7d6-1bed550920b7", "email": "testuser_1763044109158@example.com", "position": "midfielder", "last_name": "Kowalski", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:28:30.844446+00', '2025-11-13 14:28:30.844497+00', '2025-11-13 14:28:30.844497+00', '8802d6df-826f-43d4-afbb-f7de0a7ef99f'),
	('4e1bb2a5-d38e-4dea-9f8b-e269459cfe07', '4e1bb2a5-d38e-4dea-9f8b-e269459cfe07', '{"sub": "4e1bb2a5-d38e-4dea-9f8b-e269459cfe07", "email": "testuser_1763044232741@example.com", "position": "midfielder", "last_name": "Kowalski2741", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:30:36.549532+00', '2025-11-13 14:30:36.549613+00', '2025-11-13 14:30:36.549613+00', '6c163dc5-fd8e-405d-8ff9-aa2aee370733'),
	('ce221240-a20f-4cb6-bce9-f68e74b95522', 'ce221240-a20f-4cb6-bce9-f68e74b95522', '{"sub": "ce221240-a20f-4cb6-bce9-f68e74b95522", "email": "testuser_1763044319822@example.com", "position": "midfielder", "last_name": "Kowalski9822", "first_name": "Jan", "email_verified": false, "phone_verified": false}', 'email', '2025-11-13 14:32:03.957395+00', '2025-11-13 14:32:03.957461+00', '2025-11-13 14:32:03.957461+00', '1dd3e125-7769-44c0-aa78-db7cfa8deb08');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id") VALUES
	('0c5da9b1-c83c-426c-bccf-305f0c1819bc', '0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81', '2025-11-13 14:18:20.49836+00', '2025-11-13 14:18:20.49836+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('86288c14-316a-4c4d-b75c-5069d0aa842f', '65130e9a-8230-4569-a767-51b1712935e9', '2025-11-13 14:18:20.498441+00', '2025-11-13 14:18:20.498441+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('b2302291-e333-42f2-b103-67e268425c28', '1a4e0f72-80e9-483d-99ba-adc8767306a6', '2025-11-13 14:19:10.051472+00', '2025-11-13 14:19:10.051472+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('c13fc92f-8c97-46a0-a179-6a1b8a2ebb50', 'd4089e35-16b6-46a6-8bf7-1a7d2270fc17', '2025-11-13 14:19:10.664252+00', '2025-11-13 14:19:10.664252+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('66eca215-62f8-420d-844d-dae4b2840ccb', '26fc07d9-e1ed-47d6-abc2-e6f202892805', '2025-11-13 14:22:30.212152+00', '2025-11-13 14:22:30.212152+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('4e1fe85a-1283-4799-9a3d-0a043a6ff630', '4014f048-b414-428f-ac3b-9bec334fba40', '2025-11-13 14:22:30.56516+00', '2025-11-13 14:22:30.56516+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('8b72160b-55c3-4d0b-803d-657cc07c2c45', '5d0a1a68-74c4-418d-be68-f4bdb6f41874', '2025-11-13 14:24:53.616332+00', '2025-11-13 14:24:53.616332+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('2d26ee6b-5d67-4a4d-93c3-9b7fb909f169', '3e3f9c10-d3b6-4225-bc71-8a857381ca3f', '2025-11-13 14:24:54.141524+00', '2025-11-13 14:24:54.141524+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('72079b8f-f2f8-4bec-90e5-72bad177db2b', '6dc74202-d23a-4c93-8411-31b9101bd84f', '2025-11-13 14:26:49.417965+00', '2025-11-13 14:26:49.417965+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('d97003b3-1d13-47d3-a2c7-dc9c67b289fb', '5347bb1a-1694-492c-bafa-c5c18c525835', '2025-11-13 14:26:49.443796+00', '2025-11-13 14:26:49.443796+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('9605f04a-4efa-4a86-b8b5-98ef409640a3', '59a860cf-1ee6-45ad-9791-1af10bef6950', '2025-11-13 14:28:30.526271+00', '2025-11-13 14:28:30.526271+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('aa95c711-6989-467d-a1a6-7bce1b23a8ff', '7b7db572-8c78-400a-b7d6-1bed550920b7', '2025-11-13 14:28:30.860985+00', '2025-11-13 14:28:30.860985+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('42d50eb4-7672-4b40-b4b9-ac6bfe52c577', '4e1bb2a5-d38e-4dea-9f8b-e269459cfe07', '2025-11-13 14:30:36.573961+00', '2025-11-13 14:30:36.573961+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('f4c5759f-edb2-4942-9a9a-b0e00cdd3972', 'ce221240-a20f-4cb6-bce9-f68e74b95522', '2025-11-13 14:32:03.967195+00', '2025-11-13 14:32:03.967195+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL),
	('81b7e1e8-921f-4b82-9091-51162cea1c92', '601f8b1c-9c9c-492b-89ee-2f60ae0d562d', '2025-11-14 16:46:06.873367+00', '2025-11-14 17:44:53.917805+00', NULL, 'aal1', NULL, '2025-11-14 17:44:53.917757', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('0c5da9b1-c83c-426c-bccf-305f0c1819bc', '2025-11-13 14:18:20.504487+00', '2025-11-13 14:18:20.504487+00', 'password', '1c2d8a6a-0ef5-41a9-8e2c-5b4732ab2410'),
	('86288c14-316a-4c4d-b75c-5069d0aa842f', '2025-11-13 14:18:20.505465+00', '2025-11-13 14:18:20.505465+00', 'password', 'df9082de-03b3-427d-b736-261c5904e426'),
	('b2302291-e333-42f2-b103-67e268425c28', '2025-11-13 14:19:10.059879+00', '2025-11-13 14:19:10.059879+00', 'password', '278aa34f-df43-40e5-a86d-a22faba0100d'),
	('c13fc92f-8c97-46a0-a179-6a1b8a2ebb50', '2025-11-13 14:19:10.667479+00', '2025-11-13 14:19:10.667479+00', 'password', '33872ab0-7708-4473-8ad4-1c3189f1dec5'),
	('66eca215-62f8-420d-844d-dae4b2840ccb', '2025-11-13 14:22:30.219301+00', '2025-11-13 14:22:30.219301+00', 'password', '5c45001d-4e11-461f-8ee7-ca94402b8bae'),
	('4e1fe85a-1283-4799-9a3d-0a043a6ff630', '2025-11-13 14:22:30.567318+00', '2025-11-13 14:22:30.567318+00', 'password', '34b237a0-acd1-478d-ac88-7e7290756d9f'),
	('8b72160b-55c3-4d0b-803d-657cc07c2c45', '2025-11-13 14:24:53.620113+00', '2025-11-13 14:24:53.620113+00', 'password', '3e90cf57-8299-410a-8f97-99d770e57c88'),
	('2d26ee6b-5d67-4a4d-93c3-9b7fb909f169', '2025-11-13 14:24:54.143834+00', '2025-11-13 14:24:54.143834+00', 'password', 'a94559d1-50ae-4b3f-9cf2-a5f1ed043914'),
	('72079b8f-f2f8-4bec-90e5-72bad177db2b', '2025-11-13 14:26:49.421737+00', '2025-11-13 14:26:49.421737+00', 'password', 'a8a28d32-3fec-4ce0-9ee2-a2cd911283db'),
	('d97003b3-1d13-47d3-a2c7-dc9c67b289fb', '2025-11-13 14:26:49.447471+00', '2025-11-13 14:26:49.447471+00', 'password', '4a2938ce-18bd-4b2f-abb6-e6e3d70c7ccd'),
	('9605f04a-4efa-4a86-b8b5-98ef409640a3', '2025-11-13 14:28:30.528404+00', '2025-11-13 14:28:30.528404+00', 'password', '3a949d6a-f7ad-436d-9697-af1cd7626fac'),
	('aa95c711-6989-467d-a1a6-7bce1b23a8ff', '2025-11-13 14:28:30.865106+00', '2025-11-13 14:28:30.865106+00', 'password', '6d93ee94-41ab-4d1b-ae08-eaf7f36c4f0a'),
	('42d50eb4-7672-4b40-b4b9-ac6bfe52c577', '2025-11-13 14:30:36.589737+00', '2025-11-13 14:30:36.589737+00', 'password', 'bff961e3-f812-4a95-a502-6cab587a4bff'),
	('f4c5759f-edb2-4942-9a9a-b0e00cdd3972', '2025-11-13 14:32:03.970065+00', '2025-11-13 14:32:03.970065+00', 'password', 'd17cebcb-7260-4c21-8b61-63388eeb058f'),
	('81b7e1e8-921f-4b82-9091-51162cea1c92', '2025-11-14 16:46:06.89217+00', '2025-11-14 16:46:06.89217+00', 'password', '1afa990c-070d-4aeb-8c11-b08e22a433af');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 12, '5mxnrafknyq4', '0cb332dc-2195-4fe5-8ca2-dd8cb4b4be81', false, '2025-11-13 14:18:20.501114+00', '2025-11-13 14:18:20.501114+00', NULL, '0c5da9b1-c83c-426c-bccf-305f0c1819bc'),
	('00000000-0000-0000-0000-000000000000', 13, 'hi6mf3rezsqz', '65130e9a-8230-4569-a767-51b1712935e9', false, '2025-11-13 14:18:20.501152+00', '2025-11-13 14:18:20.501152+00', NULL, '86288c14-316a-4c4d-b75c-5069d0aa842f'),
	('00000000-0000-0000-0000-000000000000', 14, 'tdtyfpx23lsv', '1a4e0f72-80e9-483d-99ba-adc8767306a6', false, '2025-11-13 14:19:10.05296+00', '2025-11-13 14:19:10.05296+00', NULL, 'b2302291-e333-42f2-b103-67e268425c28'),
	('00000000-0000-0000-0000-000000000000', 15, 'q3phmvusz5cm', 'd4089e35-16b6-46a6-8bf7-1a7d2270fc17', false, '2025-11-13 14:19:10.665454+00', '2025-11-13 14:19:10.665454+00', NULL, 'c13fc92f-8c97-46a0-a179-6a1b8a2ebb50'),
	('00000000-0000-0000-0000-000000000000', 16, 'jt3g7hmbpkdo', '26fc07d9-e1ed-47d6-abc2-e6f202892805', false, '2025-11-13 14:22:30.216471+00', '2025-11-13 14:22:30.216471+00', NULL, '66eca215-62f8-420d-844d-dae4b2840ccb'),
	('00000000-0000-0000-0000-000000000000', 17, 't74abjemlebm', '4014f048-b414-428f-ac3b-9bec334fba40', false, '2025-11-13 14:22:30.566057+00', '2025-11-13 14:22:30.566057+00', NULL, '4e1fe85a-1283-4799-9a3d-0a043a6ff630'),
	('00000000-0000-0000-0000-000000000000', 18, 'hhsc7j5lqbry', '5d0a1a68-74c4-418d-be68-f4bdb6f41874', false, '2025-11-13 14:24:53.617783+00', '2025-11-13 14:24:53.617783+00', NULL, '8b72160b-55c3-4d0b-803d-657cc07c2c45'),
	('00000000-0000-0000-0000-000000000000', 19, 's6wbrvcuceit', '3e3f9c10-d3b6-4225-bc71-8a857381ca3f', false, '2025-11-13 14:24:54.142375+00', '2025-11-13 14:24:54.142375+00', NULL, '2d26ee6b-5d67-4a4d-93c3-9b7fb909f169'),
	('00000000-0000-0000-0000-000000000000', 20, 'n2zid5p6c37w', '6dc74202-d23a-4c93-8411-31b9101bd84f', false, '2025-11-13 14:26:49.419525+00', '2025-11-13 14:26:49.419525+00', NULL, '72079b8f-f2f8-4bec-90e5-72bad177db2b'),
	('00000000-0000-0000-0000-000000000000', 21, 'by5y64kr6wzh', '5347bb1a-1694-492c-bafa-c5c18c525835', false, '2025-11-13 14:26:49.445082+00', '2025-11-13 14:26:49.445082+00', NULL, 'd97003b3-1d13-47d3-a2c7-dc9c67b289fb'),
	('00000000-0000-0000-0000-000000000000', 22, 'znknwu3f7ygw', '59a860cf-1ee6-45ad-9791-1af10bef6950', false, '2025-11-13 14:28:30.527195+00', '2025-11-13 14:28:30.527195+00', NULL, '9605f04a-4efa-4a86-b8b5-98ef409640a3'),
	('00000000-0000-0000-0000-000000000000', 23, 'kxqmfwpbzbxt', '7b7db572-8c78-400a-b7d6-1bed550920b7', false, '2025-11-13 14:28:30.862277+00', '2025-11-13 14:28:30.862277+00', NULL, 'aa95c711-6989-467d-a1a6-7bce1b23a8ff'),
	('00000000-0000-0000-0000-000000000000', 24, 'q43rkthmoxth', '4e1bb2a5-d38e-4dea-9f8b-e269459cfe07', false, '2025-11-13 14:30:36.575166+00', '2025-11-13 14:30:36.575166+00', NULL, '42d50eb4-7672-4b40-b4b9-ac6bfe52c577'),
	('00000000-0000-0000-0000-000000000000', 25, 'kobd7vcohi2h', 'ce221240-a20f-4cb6-bce9-f68e74b95522', false, '2025-11-13 14:32:03.968544+00', '2025-11-13 14:32:03.968544+00', NULL, 'f4c5759f-edb2-4942-9a9a-b0e00cdd3972'),
	('00000000-0000-0000-0000-000000000000', 27, 'x3n2rc7ddyko', '601f8b1c-9c9c-492b-89ee-2f60ae0d562d', true, '2025-11-14 16:46:06.880384+00', '2025-11-14 17:44:34.77418+00', NULL, '81b7e1e8-921f-4b82-9091-51162cea1c92'),
	('00000000-0000-0000-0000-000000000000', 28, 'lym4ushhwi7p', '601f8b1c-9c9c-492b-89ee-2f60ae0d562d', false, '2025-11-14 17:44:34.775997+00', '2025-11-14 17:44:34.775997+00', 'x3n2rc7ddyko', '81b7e1e8-921f-4b82-9091-51162cea1c92');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."players" ("id", "first_name", "last_name", "position", "skill_rate", "date_of_birth", "created_at", "updated_at", "deleted_at") VALUES
	(555, 'Dev', 'Administrator', 'midfielder', 8, '1995-04-12', '2025-04-16 20:39:15.072277+00', '2025-11-12 20:39:15.072277+00', NULL),
	(556, 'Anna', 'Striker', 'forward', 9, '1998-08-21', '2025-06-05 20:39:15.072277+00', '2025-11-12 20:39:15.072277+00', NULL),
	(557, 'Bartek', 'Keeper', 'goalkeeper', 8, '1992-02-10', '2025-03-17 20:39:15.072277+00', '2025-11-12 20:39:15.072277+00', NULL),
	(558, 'Alicja', 'Defender', 'defender', 7, '1996-06-18', '2025-05-06 20:39:15.072277+00', '2025-11-12 20:39:15.072277+00', NULL),
	(559, 'Michał', 'Playmaker', 'midfielder', 8, '1994-11-05', '2025-05-21 20:39:15.072277+00', '2025-11-12 20:39:15.072277+00', NULL),
	(1, 'Marian', 'Huja', 'defender', 4, '2000-05-05', '2025-11-12 21:14:55.984914+00', '2025-11-12 21:14:55.984914+00', NULL),
	(2, 'Taras', 'Rozmaryńczuk', 'forward', 7, '1995-05-05', '2025-11-12 21:15:50.408438+00', '2025-11-12 21:15:50.408438+00', NULL),
	(3, 'Jan', 'Urban', 'forward', 8, '1980-08-08', '2025-11-12 21:16:22.277573+00', '2025-11-12 21:16:22.277573+00', NULL),
	(4, 'Tymoteusz', 'Puchacz', 'defender', 5, '1990-06-06', '2025-11-12 21:17:09.091872+00', '2025-11-12 21:17:09.091872+00', NULL),
	(5, 'Junior', 'Magalaeus', 'midfielder', 7, '2000-09-30', '2025-11-12 21:17:44.853395+00', '2025-11-12 21:17:44.853395+00', NULL),
	(6, 'Krajci', 'Rejan', 'forward', 3, '2000-05-03', '2025-11-12 21:18:15.100129+00', '2025-11-12 21:18:15.100129+00', NULL),
	(7, 'Zawodnik', 'Zawodnik', 'midfielder', 7, '1996-01-26', '2025-11-12 22:29:24.482774+00', '2025-11-12 22:29:24.482774+00', NULL),
	(8, 'Organizator', 'Organizator', 'midfielder', 5, NULL, '2025-11-12 22:34:07.923779+00', '2025-11-12 22:34:07.923779+00', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "password_hash", "first_name", "last_name", "role", "status", "consent_date", "consent_version", "player_id", "created_at", "updated_at", "deleted_at") VALUES
	(9999, 'dev.admin@fairplay.local', 'dev-mode-password', 'Dev', 'Administrator', 'admin', 'approved', '2025-09-28 20:39:15.072277+00', '1.0', 555, '2025-09-28 20:39:15.072277+00', '2025-11-12 20:39:15.072277+00', NULL),
	(1, 'yegomejl@gmail.com', 'supabase-auth-managed', 'Tobiasz', 'Tobiaszowski', 'admin', 'approved', '2025-11-12 21:12:21.078+00', '1.0', 559, '2025-11-12 21:12:21.082239+00', '2025-11-12 21:12:21.082239+00', NULL),
	(2, 'testowy_zawodnik@gmail.com', 'supabase-auth-managed', 'Zawodnik', 'Zawodnik', 'player', 'approved', '2025-11-12 22:27:40.988+00', '1.0', 7, '2025-11-12 22:27:41.002882+00', '2025-11-12 22:29:24.506+00', NULL),
	(3, 'testowy_organizator@gmail.com', 'supabase-auth-managed', 'Organizator', 'Organizator', 'player', 'approved', '2025-11-12 22:33:12.317+00', '1.0', 8, '2025-11-12 22:33:12.331971+00', '2025-11-12 22:34:07.932+00', NULL),
	(4, 'testuser_1763043498600@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski', 'player', 'pending', '2025-11-13 14:18:20.517+00', '1.0', NULL, '2025-11-13 14:18:20.533247+00', '2025-11-13 14:18:20.533247+00', NULL),
	(5, 'testuser_1763043495351@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski5351', 'player', 'pending', '2025-11-13 14:18:20.521+00', '1.0', NULL, '2025-11-13 14:18:20.533316+00', '2025-11-13 14:18:20.533316+00', NULL),
	(6, 'testuser_1763043546295@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski6295', 'player', 'pending', '2025-11-13 14:19:10.07+00', '1.0', NULL, '2025-11-13 14:19:10.101896+00', '2025-11-13 14:19:10.101896+00', NULL),
	(7, 'testuser_1763043548959@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski', 'player', 'pending', '2025-11-13 14:19:10.677+00', '1.0', NULL, '2025-11-13 14:19:10.73226+00', '2025-11-13 14:19:10.73226+00', NULL),
	(8, 'testuser_1763043745849@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski5849', 'player', 'pending', '2025-11-13 14:22:30.232+00', '1.0', NULL, '2025-11-13 14:22:30.291081+00', '2025-11-13 14:22:30.291081+00', NULL),
	(9, 'testuser_1763043749046@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski', 'player', 'pending', '2025-11-13 14:22:30.573+00', '1.0', NULL, '2025-11-13 14:22:30.580263+00', '2025-11-13 14:22:30.580263+00', NULL),
	(10, 'testuser_1763043889318@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski9318', 'player', 'pending', '2025-11-13 14:24:53.627+00', '1.0', NULL, '2025-11-13 14:24:53.654651+00', '2025-11-13 14:24:53.654651+00', NULL),
	(11, 'testuser_1763043892378@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski', 'player', 'pending', '2025-11-13 14:24:54.148+00', '1.0', NULL, '2025-11-13 14:24:54.153787+00', '2025-11-13 14:24:54.153787+00', NULL),
	(12, 'testuser_1763044007621@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski', 'player', 'pending', '2025-11-13 14:26:49.429+00', '1.0', NULL, '2025-11-13 14:26:49.439773+00', '2025-11-13 14:26:49.439773+00', NULL),
	(13, 'testuser_1763044005023@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski5023', 'player', 'pending', '2025-11-13 14:26:49.453+00', '1.0', NULL, '2025-11-13 14:26:49.460302+00', '2025-11-13 14:26:49.460302+00', NULL),
	(14, 'testuser_1763044105974@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski5974', 'player', 'pending', '2025-11-13 14:28:30.533+00', '1.0', NULL, '2025-11-13 14:28:30.550595+00', '2025-11-13 14:28:30.550595+00', NULL),
	(15, 'testuser_1763044109158@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski', 'player', 'pending', '2025-11-13 14:28:30.917+00', '1.0', NULL, '2025-11-13 14:28:30.928234+00', '2025-11-13 14:28:30.928234+00', NULL),
	(16, 'testuser_1763044232741@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski2741', 'player', 'pending', '2025-11-13 14:30:36.6+00', '1.0', NULL, '2025-11-13 14:30:36.642314+00', '2025-11-13 14:30:36.642314+00', NULL),
	(17, 'testuser_1763044319822@example.com', 'supabase-auth-managed', 'Jan', 'Kowalski9822', 'player', 'pending', '2025-11-13 14:32:03.976+00', '1.0', NULL, '2025-11-13 14:32:04.007018+00', '2025-11-13 14:32:04.007018+00', NULL);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."audit_logs" ("id", "timestamp", "action_type", "actor_id", "target_table", "target_id", "changes", "ip_address") VALUES
	(1, '2025-11-12 21:20:33.75936+00', 'team_draw', 1, 'events', 301, '{"iterations": 20, "teams_count": 2, "balance_achieved": false, "balance_threshold": 0.07}', '127.0.0.1'),
	(2, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(3, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(4, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(5, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(6, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(7, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(8, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(9, '2025-11-12 21:20:45.579138+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:45.556206+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(10, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(11, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(12, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(13, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(14, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 1, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(15, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(16, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(17, '2025-11-12 21:20:53.279076+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 2, "assignment_timestamp": "2025-11-12T21:20:53.257735+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(18, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 1, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(19, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(20, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(21, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 1, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(22, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 2, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(23, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 2, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(24, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 2, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(25, '2025-11-12 21:22:56.09382+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 2, "assignment_timestamp": "2025-11-12T21:22:56.068196+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(26, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(27, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(28, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(29, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(30, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(31, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(32, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(33, '2025-11-12 21:49:39.874061+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:39.842289+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(34, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(35, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(36, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(37, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(38, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(39, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(40, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(41, '2025-11-12 21:49:44.046099+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:44.02306+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(42, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(43, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(44, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(45, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 2, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(46, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(47, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(48, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(49, '2025-11-12 21:49:50.42557+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 1, "assignment_timestamp": "2025-11-12T21:49:50.40116+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(50, '2025-11-12 21:50:20.370913+00', 'team_draw', 1, 'events', 301, '{"iterations": 20, "teams_count": 2, "balance_achieved": false, "balance_threshold": 0.07}', '127.0.0.1'),
	(51, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 1, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(52, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 1, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(53, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(54, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 1, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(55, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 2, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(56, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 2, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(57, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(58, '2025-11-12 21:50:30.756003+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 2, "assignment_timestamp": "2025-11-12T21:50:30.632675+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(59, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 5, "team_number": 1, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(60, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2, "team_number": 1, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(61, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 1, "team_number": 1, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(62, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2002, "team_number": 1, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(63, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2003, "team_number": 1, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(64, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 3, "team_number": 2, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(65, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 4, "team_number": 2, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(66, '2025-11-12 21:52:18.063482+00', 'team_reassigned', 1, 'events', 301, '{"signup_id": 2001, "team_number": 2, "assignment_timestamp": "2025-11-12T21:52:18.035783+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(67, '2025-11-12 22:07:06.687311+00', 'team_draw', 1, 'events', 303, '{"iterations": 20, "teams_count": 2, "balance_achieved": false, "balance_threshold": 0.07}', '127.0.0.1'),
	(68, '2025-11-12 22:07:18.497446+00', 'team_reassigned', 1, 'events', 303, '{"signup_id": 2006, "team_number": 1, "assignment_timestamp": "2025-11-12T22:07:18.473991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(69, '2025-11-12 22:07:18.497446+00', 'team_reassigned', 1, 'events', 303, '{"signup_id": 8, "team_number": 1, "assignment_timestamp": "2025-11-12T22:07:18.473991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(70, '2025-11-12 22:07:18.497446+00', 'team_reassigned', 1, 'events', 303, '{"signup_id": 7, "team_number": 2, "assignment_timestamp": "2025-11-12T22:07:18.473991+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(71, '2025-11-12 22:07:18.497446+00', 'team_reassigned', 1, 'events', 303, '{"signup_id": 6, "team_number": 2, "assignment_timestamp": "2025-11-12T22:07:18.473991+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(72, '2025-11-12 22:29:24.528824+00', 'user_approved', 1, 'users', 2, '{"new_role": "player", "new_status": "approved", "new_player_id": 7, "previous_role": "player", "previous_status": "pending", "previous_player_id": null}', NULL),
	(73, '2025-11-12 22:34:07.944145+00', 'user_approved', 1, 'users', 3, '{"new_role": "player", "new_status": "approved", "new_player_id": 8, "previous_role": "player", "previous_status": "pending", "previous_player_id": null}', NULL),
	(74, '2025-11-14 16:51:57.991239+00', 'team_draw', 1, 'events', 1, '{"iterations": 20, "teams_count": 2, "balance_achieved": false, "balance_threshold": 0.07}', '127.0.0.1'),
	(75, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 19, "team_number": 1, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(76, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 17, "team_number": 1, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(77, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 18, "team_number": 1, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(78, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 12, "team_number": 1, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(79, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 14, "team_number": 1, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 1}', '127.0.0.1'),
	(80, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 10, "team_number": 2, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(81, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 11, "team_number": 2, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(82, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 15, "team_number": 2, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(83, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 13, "team_number": 2, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 2}', '127.0.0.1'),
	(84, '2025-11-14 16:52:49.13428+00', 'team_reassigned', 1, 'events', 1, '{"signup_id": 16, "team_number": 2, "assignment_timestamp": "2025-11-14T16:52:49.104991+00:00", "previous_team_number": 2}', '127.0.0.1');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("id", "name", "location", "event_datetime", "max_places", "optional_fee", "status", "current_signups_count", "organizer_id", "created_at", "updated_at", "deleted_at", "teams_drawn_at", "preferred_team_count") VALUES
	(301, 'Trening Drużynowy', 'Hala Sportowa', '2025-11-14 20:39:00+00', 8, 20.00, 'active', 8, 9999, '2025-10-29 20:39:15.072277+00', '2025-11-12 21:20:14.805+00', NULL, '2025-11-12 21:52:18.045+00', 2),
	(303, 'Turniej FairPlay', 'Centrum Sportowe', '2025-11-24 20:39:00+00', 4, 25.00, 'active', 4, 9999, '2025-10-13 20:39:15.072277+00', '2025-11-12 22:07:00.449+00', NULL, '2025-11-12 22:07:18.485+00', 2),
	(302, 'Sparing Weekendowy', 'Stadion Miejski', '2025-11-17 20:39:15.072277+00', 22, 15.00, 'active', 3, 9999, '2025-11-02 20:39:15.072277+00', '2025-11-12 22:32:01.187+00', NULL, NULL, NULL),
	(1, 'Czwartkowe granie', 'Hala Sportowa Zabrze', '2025-11-14 23:48:00+00', 10, 20.00, 'active', 10, 1, '2025-11-14 16:49:15.207536+00', '2025-11-14 16:53:59.879+00', NULL, '2025-11-14 16:52:49.117+00', 2);


--
-- Data for Name: event_signups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_signups" ("id", "event_id", "player_id", "signup_timestamp", "status", "resignation_timestamp") VALUES
	(2001, 301, 555, '2025-11-09 20:39:15.072277+00', 'confirmed', NULL),
	(2002, 301, 556, '2025-11-08 20:39:15.072277+00', 'confirmed', NULL),
	(2003, 301, 557, '2025-11-07 20:39:15.072277+00', 'confirmed', NULL),
	(2004, 302, 556, '2025-11-10 20:39:15.072277+00', 'confirmed', NULL),
	(2005, 302, 558, '2025-11-10 20:39:15.072277+00', 'confirmed', NULL),
	(2006, 303, 559, '2025-11-11 20:39:15.072277+00', 'confirmed', NULL),
	(1, 301, 6, '2025-11-12 21:19:51.458+00', 'confirmed', NULL),
	(2, 301, 5, '2025-11-12 21:19:58.575+00', 'confirmed', NULL),
	(3, 301, 2, '2025-11-12 21:20:03.527+00', 'confirmed', NULL),
	(4, 301, 4, '2025-11-12 21:20:06.976+00', 'confirmed', NULL),
	(5, 301, 559, '2025-11-12 21:20:14.78+00', 'confirmed', NULL),
	(6, 303, 557, '2025-11-12 22:06:52.732+00', 'confirmed', NULL),
	(7, 303, 5, '2025-11-12 22:06:56.397+00', 'confirmed', NULL),
	(8, 303, 4, '2025-11-12 22:07:00.438+00', 'confirmed', NULL),
	(9, 302, 7, '2025-11-12 22:32:01.179+00', 'confirmed', NULL),
	(10, 1, 7, '2025-11-14 16:49:27.791+00', 'confirmed', NULL),
	(11, 1, 558, '2025-11-14 16:49:34.965+00', 'confirmed', NULL),
	(12, 1, 1, '2025-11-14 16:49:42.77+00', 'confirmed', NULL),
	(13, 1, 6, '2025-11-14 16:49:49.564+00', 'confirmed', NULL),
	(14, 1, 2, '2025-11-14 16:49:56.038+00', 'confirmed', NULL),
	(15, 1, 559, '2025-11-14 16:50:02.534+00', 'confirmed', NULL),
	(16, 1, 3, '2025-11-14 16:50:09.495+00', 'confirmed', NULL),
	(17, 1, 4, '2025-11-14 16:50:18.861+00', 'confirmed', NULL),
	(18, 1, 5, '2025-11-14 16:50:24.701+00', 'confirmed', NULL),
	(19, 1, 556, '2025-11-14 16:50:30.886+00', 'withdrawn', '2025-11-14 16:53:59.784+00'),
	(20, 1, 557, '2025-11-14 16:50:38.583+00', 'confirmed', NULL);


--
-- Data for Name: team_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."team_assignments" ("id", "signup_id", "team_number", "assignment_timestamp", "team_color") VALUES
	(73, 5, 1, '2025-11-12 21:52:18.035783+00', 'black'),
	(74, 2, 1, '2025-11-12 21:52:18.035783+00', 'black'),
	(75, 1, 1, '2025-11-12 21:52:18.035783+00', 'black'),
	(76, 2002, 1, '2025-11-12 21:52:18.035783+00', 'black'),
	(77, 2003, 1, '2025-11-12 21:52:18.035783+00', 'black'),
	(78, 3, 2, '2025-11-12 21:52:18.035783+00', 'white'),
	(79, 4, 2, '2025-11-12 21:52:18.035783+00', 'white'),
	(80, 2001, 2, '2025-11-12 21:52:18.035783+00', 'white'),
	(85, 2006, 1, '2025-11-12 22:07:18.473991+00', 'black'),
	(86, 8, 1, '2025-11-12 22:07:18.473991+00', 'black'),
	(87, 7, 2, '2025-11-12 22:07:18.473991+00', 'white'),
	(88, 6, 2, '2025-11-12 22:07:18.473991+00', 'white'),
	(99, 19, 1, '2025-11-14 16:52:49.104991+00', 'black'),
	(100, 17, 1, '2025-11-14 16:52:49.104991+00', 'black'),
	(101, 18, 1, '2025-11-14 16:52:49.104991+00', 'black'),
	(102, 12, 1, '2025-11-14 16:52:49.104991+00', 'black'),
	(103, 14, 1, '2025-11-14 16:52:49.104991+00', 'black'),
	(104, 10, 2, '2025-11-14 16:52:49.104991+00', 'white'),
	(105, 11, 2, '2025-11-14 16:52:49.104991+00', 'white'),
	(106, 15, 2, '2025-11-14 16:52:49.104991+00', 'white'),
	(107, 13, 2, '2025-11-14 16:52:49.104991+00', 'white'),
	(108, 16, 2, '2025-11-14 16:52:49.104991+00', 'white');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 28, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."audit_logs_id_seq"', 84, true);


--
-- Name: event_signups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_signups_id_seq"', 20, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_id_seq"', 1, true);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."players_id_seq"', 8, true);


--
-- Name: team_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."team_assignments_id_seq"', 108, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."users_id_seq"', 17, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict HYdFaWYaM4R785Yj8v9a7MnZdVsYfSNaURPZXVsOumjVyksSiMfjjaY66eTvkp3

RESET ALL;
