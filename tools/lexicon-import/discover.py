#!/usr/bin/env python3
"""Discover plausible safety candidates without assigning final classifications."""
from __future__ import annotations
import argparse, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
SEEDS={"explicit_anatomy":["genital","penis","vagina","vulva","testicle","anus"],"nudity_or_exposure":["nude","nudity","naked","topless","bottomless","exposed"],"sexual_act":["sex","sexual","masturb","intercourse","oral sex"],"sexual_position":["sex position","sexual position"],"sexual_fluids_or_climax":["orgasm","ejaculat","semen"],"fetish_or_bondage":["bondage","bdsm","fetish"],"pornographic_framing":["porn","explicit","nsfw"],"revealing_clothing":["lingerie","underwear","bikini","swimsuit"],"affection_or_contact":["kiss","hug"]}
def load(p): return json.loads(Path(p).read_text(encoding="utf-8"))
def score(t): return max((s.get("post_count") or 0 for s in t.get("sources",[])),default=0)
def main():
 ap=argparse.ArgumentParser();ap.add_argument("target",choices=["safety"]);ap.add_argument("--normalized",type=Path);ap.add_argument("--output-dir",type=Path);a=ap.parse_args();build=a.output_dir or ROOT/"build"/a.target;doc=load(a.normalized or build/"normalized.json");decisions={d["term"] for d in load(ROOT/"decisions"/f"{a.target}.json")["decisions"]};c=[]
 for item in doc["terms"]:
  if item["term"] in decisions: continue
  hay=" ".join([item["term"],*item.get("aliases",[])]).lower();matches=[]
  for category,seeds in SEEDS.items():
   found=sorted({s for s in seeds if re.search(r"(?<![a-z])"+re.escape(s),hay)})
   if found: matches.append({"category":category,"seeds":found})
  if matches:c.append({**item,"suggested_categories":[m["category"] for m in matches],"discovery_matches":matches,"priority_post_count":score(item)})
 c.sort(key=lambda x:(-x["priority_post_count"],x["term"]));build.mkdir(parents=True,exist_ok=True);out={"schema_version":1,"target":a.target,"term_count":len(c),"terms":c};p=build/"candidates.json";p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8");print(f"Wrote {len(c)} candidates to {p}")
if __name__=="__main__":main()
