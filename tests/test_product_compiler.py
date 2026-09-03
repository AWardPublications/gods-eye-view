import os
import sys
import unittest
import tempfile
import sqlite3

# Ensure parent directory is in path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
sys.path.append(os.path.join(parent_dir, "scratch"))

from compile_product import ProductCompiler

class TestProductCompiler(unittest.TestCase):
    """
    Test suite verifying GAMP 5 7-step pipeline compiles, TCG invariants,
    and override fatigue guard boundaries.
    """
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.tmpdir.name, "test_governance.db")
        self.templates_path = os.path.join(parent_dir, "scratch", "product-manifest-templates.json")
        
        self.compiler = ProductCompiler(self.templates_path, self.db_path)
        self.passport = {
            "id": "urn:davincia:passport:human:david",
            "role": "System_Admin"
        }

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_coloring_book_happy_path(self):
        """Checks that AWP-BOK-002-COLOR product line compiles successfully."""
        input_data = {
            "headline": "Corkman observes Sion Build Operation"
        }
        res = self.compiler.run_compilation_pipeline("coloring_book", input_data, self.passport)
        self.assertEqual(res["status"], "ALLOW")
        self.assertIn("cork texture", res["product"]["hierarchy"]["subject"])
        self.assertEqual(res["product"]["design"]["borders"], "Linen White (#FBFBFA)")

    def test_storybook_happy_path(self):
        """Checks storybook compiles with appropriate linguistic inputs."""
        input_data = {
            "headline": "Kinsale Harbour Regatta",
            "command": "ExecuteCompileCommand",
            "text": "The wind was strong across the harbor, blowing sails and moving waves."
        }
        res = self.compiler.run_compilation_pipeline("narrative_storybook", input_data, self.passport)
        self.assertEqual(res["status"], "ALLOW")
        self.assertIn("watercolor", res["product"]["style_modifier"])

    def test_storybook_command_five_character_fail(self):
        """Asserts command checks fail when voice linter command is <= 5 chars."""
        input_data = {
            "headline": "Kinsale Harbour Regatta",
            "command": "Yes", # Fails five character threshold
            "text": "The wind was strong across the harbor, blowing sails."
        }
        with self.assertRaises(ValueError) as ctx:
            self.compiler.run_compilation_pipeline("narrative_storybook", input_data, self.passport)
        self.assertIn("five-character threshold", str(ctx.exception))

    def test_storybook_telemetry_short_fail(self):
        """Asserts compilation fails when story text is shorter than 50 characters."""
        input_data = {
            "headline": "Kinsale Harbour Regatta",
            "command": "ExecuteCompileCommand",
            "text": "Too short." # Fails 50-character rule
        }
        with self.assertRaises(ValueError) as ctx:
            self.compiler.run_compilation_pipeline("narrative_storybook", input_data, self.passport)
        self.assertIn("at least 50 characters", str(ctx.exception))

    def test_tcg_card_happy_path(self):
        """Checks TCG Card complies with the stat budget of 24."""
        input_data = {
            "headline": "Sion Alpine Champion",
            "character_name": "Sion Champion",
            "base_power": 24,
            "stats": {
                "sound": 6,
                "cop_on": 6,
                "neck": 6,
                "rebel": 6
            }
        }
        res = self.compiler.run_compilation_pipeline("tcg_playing_card", input_data, self.passport)
        self.assertEqual(res["status"], "ALLOW")
        self.assertIn("DPF", res["product"]["design"]["seal"])

    def test_tcg_card_budget_breach_fail(self):
        """Checks TCG Card fails if stats budget is not exactly 24."""
        input_data = {
            "headline": "Sion Alpine Champion",
            "character_name": "Sion Champion",
            "base_power": 24,
            "stats": {
                "sound": 10,
                "cop_on": 10,
                "neck": 10,
                "rebel": 10  # sum = 40 (fails budget = 24)
            }
        }
        with self.assertRaises(ValueError) as ctx:
            self.compiler.run_compilation_pipeline("tcg_playing_card", input_data, self.passport)
        self.assertIn("must equal 24", str(ctx.exception))

    def test_tcg_card_blocked_name_fail(self):
        """Checks TCG Card fails if it references trademarked terms."""
        input_data = {
            "headline": "Barry's Tea Time",
            "character_name": "Barry's Tea Master",
            "base_power": 24,
            "stats": {
                "sound": 6,
                "cop_on": 6,
                "neck": 6,
                "rebel": 6
            }
        }
        with self.assertRaises(ValueError) as ctx:
            self.compiler.run_compilation_pipeline("tcg_playing_card", input_data, self.passport)
        self.assertIn("blocked trademark", str(ctx.exception))

    def test_overrides_fatigue_guard(self):
        """Asserts system freezes on a third consecutive successful override."""
        input_data = {
            "headline": "Alpine Speedgolf Valais Documentary Frame"
        }
        
        # 1st Override
        res1 = self.compiler.run_compilation_pipeline("art_poster", input_data, self.passport, is_override=True)
        self.assertEqual(res1["status"], "OVERRIDE_ALLOW")
        
        # 2nd Override
        res2 = self.compiler.run_compilation_pipeline("art_poster", input_data, self.passport, is_override=True)
        self.assertEqual(res2["status"], "OVERRIDE_ALLOW")
        
        # 3rd Override should raise GOVERNANCE_FREEZE
        with self.assertRaises(RuntimeError) as ctx:
            self.compiler.run_compilation_pipeline("art_poster", input_data, self.passport, is_override=True)
        self.assertIn("GOVERNANCE_FREEZE", str(ctx.exception))

if __name__ == "__main__":
    unittest.main()
