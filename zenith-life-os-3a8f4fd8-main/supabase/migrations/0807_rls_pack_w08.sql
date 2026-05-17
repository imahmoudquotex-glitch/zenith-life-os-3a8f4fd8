-- Migration 0807: rls_pack_w08

-- formula_definitions
CREATE POLICY "Users can view formula_definitions in their workspaces"
    ON formula_definitions FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create formula_definitions in their workspaces"
    ON formula_definitions FOR INSERT
    WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update formula_definitions in their workspaces"
    ON formula_definitions FOR UPDATE
    USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
    WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete formula_definitions in their workspaces"
    ON formula_definitions FOR DELETE
    USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- formula_cache
CREATE POLICY "Users can view formula_cache in their workspaces"
    ON formula_cache FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "System can manage formula_cache"
    ON formula_cache FOR ALL
    USING (true)
    WITH CHECK (true);

-- recalc_jobs
CREATE POLICY "Users can view recalc_jobs in their workspaces"
    ON recalc_jobs FOR SELECT
    USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "System can manage recalc_jobs"
    ON recalc_jobs FOR ALL
    USING (true)
    WITH CHECK (true);
