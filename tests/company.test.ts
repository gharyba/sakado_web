import { test } from "node:test";
import assert from "node:assert/strict";
import {
  company,
  companyActivities,
  companyTeam,
} from "../src/data/confirmed/company";
import { confirmedSite } from "../src/data/confirmed/site";

test("Phase 09 facts retain the confirmed years, founder and all three chapters", () => {
  assert.equal(company.founded, 2017);
  assert.equal(company.established, 2022);
  assert.equal(company.founder, "Mohamed Ben Beya");
  assert.deepEqual(
    company.chapters.map((chapter) => chapter.year),
    ["2017", "2022", "Aujourd’hui"],
  );
  assert.equal(confirmedSite.sinceYear, company.founded);
  assert.equal(confirmedSite.logoPath, null); // No inferred public logo approval.
});
test("the two permanent team members and seven unique activities are maintained", () => {
  assert.deepEqual(
    companyTeam.map((member) => [member.name, member.role]),
    [
      ["Ben Beya Mohamed", "Fondateur"],
      ["Bouzrara Manel", "Gérante"],
    ],
  );
  assert.deepEqual(
    companyActivities.map((activity) => activity.name),
    [
      "Randonnée",
      "Camping",
      "Kayak",
      "Paddle",
      "Exploration côtière",
      "Aventures en forêt",
      "Retraites nature",
    ],
  );
  assert.equal(
    new Set(companyActivities.map((activity) => activity.slug)).size,
    7,
  );
  assert.ok(
    companyActivities.every((activity) => activity.description.length > 30),
  );
});
