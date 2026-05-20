BEGIN;
SELECT plan(4);
SET LOCAL app.current_user_id = 'usr_q';
-- 3 calls allowed
SELECT is((SELECT allowed FROM reserve_ai_usage('usr_q','ws_q','chat','sync','req_1','openai','gpt-4')), TRUE, '1st reservation');
SELECT is((SELECT allowed FROM reserve_ai_usage('usr_q','ws_q','chat','sync','req_2','openai','gpt-4')), TRUE, '2nd reservation');
SELECT is((SELECT allowed FROM reserve_ai_usage('usr_q','ws_q','chat','sync','req_3','openai','gpt-4')), TRUE, '3rd reservation');
-- 4th blocked
SELECT is((SELECT allowed FROM reserve_ai_usage('usr_q','ws_q','chat','sync','req_4','openai','gpt-4')), FALSE, '4th blocked');
SELECT * FROM finish();
ROLLBACK;