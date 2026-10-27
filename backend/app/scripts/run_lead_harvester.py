# -*- coding: utf-8 -*-
"""
Continuous Background Harvester Daemon Script
Usage:
  python backend/app/scripts/run_lead_harvester.py [--boost 500] [--interval 25]
"""

import sys
import os
import time
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.services.lead_crawler_worker import lead_crawler_worker

def main():
    parser = argparse.ArgumentParser(description="Beraxis Background Lead Harvester Daemon")
    parser.add_argument("--boost", type=int, default=500, help="Initial rapid boost count")
    parser.add_argument("--interval", type=int, default=30, help="Sleep interval in seconds between batches")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size per cycle")
    args = parser.parse_args()

    print("=================================================================", flush=True)
    print("  BERAXIS B2B CONTINUOUS LEAD HARVESTER DAEMON", flush=True)
    print("=================================================================", flush=True)
    print(f"[*] Initial Boost Target: {args.boost} leads", flush=True)
    print(f"[*] Batch Size: {args.batch_size} leads", flush=True)
    print(f"[*] Sleep Interval: {args.interval}s", flush=True)

    # Initial rapid boost
    boosted = 0
    if args.boost > 0:
        print(f"[*] Running initial boost of ~{args.boost} real enterprise leads...", flush=True)
        while boosted < args.boost:
            batch_target = min(args.batch_size, args.boost - boosted)
            count = lead_crawler_worker.harvest_batch(batch_size=batch_target)
            boosted += count
            status = lead_crawler_worker.get_status()
            print(f"  [+] Boost progress: {boosted}/{args.boost} (Current DB Total: {status['current_db_directory_count']}, flush=True)")
            time.sleep(1)

    print("[*] Initial boost complete! Entering continuous background harvesting loop...", flush=True)
    lead_crawler_worker.is_running = True

    cycle = 1
    while True:
        try:
            print(f"\n[*] [Cycle #{cycle}] Harvesting next batch of {args.batch_size} companies...", flush=True)
            added = lead_crawler_worker.harvest_batch(batch_size=args.batch_size)
            st = lead_crawler_worker.get_status()
            print(f"[*] Cycle #{cycle} completed. Added: {added} new leads | DB Total Directory: {st['current_db_directory_count']}", flush=True)
            print(f"[*] Sleeping {args.interval}s until next harvest...", flush=True)
            cycle += 1
            time.sleep(args.interval)
        except KeyboardInterrupt:
            print("[!] Harvester daemon stopped by user.", flush=True)
            break
        except Exception as e:
            print(f"[!] Error in harvest cycle: {e}", flush=True)
            time.sleep(args.interval)

if __name__ == "__main__":
    main()
