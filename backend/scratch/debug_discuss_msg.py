from app.core.supabase_client import supabase

def debug_message_insert():
    try:
        # First, find a channel
        channels = supabase.table("mail_channel").select("*").limit(1).execute()
        if not channels.data:
            print("No channels found. Creating a test channel...")
            chan_resp = supabase.table("mail_channel").insert({"name": "debug-channel"}).execute()
            channel_id = chan_resp.data[0]["id"]
        else:
            channel_id = channels.data[0]["id"]
            
        print(f"Using Channel ID: {channel_id}")
        
        # Try to insert message
        msg_data = {
            "channel_id": channel_id,
            "body": "This is a direct test message",
            "author_name": "System Debugger"
        }
        print("Inserting message...")
        response = supabase.table("mail_message").insert(msg_data).execute()
        print(f"Success! Inserted message: {response.data}")
        
    except Exception as e:
        print(f"❌ Exception caught: {e}")

if __name__ == "__main__":
    debug_message_insert()
