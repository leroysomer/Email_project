import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Optional
from app.core.config import settings

def send_email_smtp(
    to_email: str,
    subject: str,
    body: str,
    from_email: str = None,
    smtp_config: Dict = None
) -> bool:
    """
    Send email using SMTP.
    """
    try:
        smtp_host = smtp_config.get('host') if smtp_config else settings.SMTP_HOST
        smtp_port = smtp_config.get('port') if smtp_config else settings.SMTP_PORT
        smtp_user = smtp_config.get('user') if smtp_config else settings.SMTP_USER
        smtp_password = smtp_config.get('password') if smtp_config else settings.SMTP_PASSWORD
        
        if not from_email:
            from_email = smtp_user
        
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return True
    
    except Exception as e:
        print(f"Error sending email via SMTP: {e}")
        return False

def send_email_gmail_api(
    to_email: str,
    subject: str,
    body: str,
    access_token: str
) -> bool:
    """
    Send email using Gmail API.
    Requires OAuth2 access token.
    """
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        import base64
        from email.mime.text import MIMEText
        
        creds = Credentials(token=access_token)
        service = build('gmail', 'v1', credentials=creds)
        
        message = MIMEText(body)
        message['to'] = to_email
        message['subject'] = subject
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        send_message = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        return True
    
    except Exception as e:
        print(f"Error sending email via Gmail API: {e}")
        return False

def send_email_outlook_api(
    to_email: str,
    subject: str,
    body: str,
    access_token: str
) -> bool:
    """
    Send email using Microsoft Graph API (Outlook).
    Requires OAuth2 access token.
    """
    try:
        import httpx
        
        url = "https://graph.microsoft.com/v1.0/me/sendMail"
        
        email_data = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "Text",
                    "content": body
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": to_email
                        }
                    }
                ]
            }
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = httpx.post(url, json=email_data, headers=headers)
        response.raise_for_status()
        
        return True
    
    except Exception as e:
        print(f"Error sending email via Outlook API: {e}")
        return False

def send_email(
    to_email: str,
    subject: str,
    body: str,
    email_service: str = "smtp",
    access_token: str = None,
    smtp_config: Dict = None
) -> bool:
    """
    Send email using the specified service.
    """
    if email_service == "gmail":
        if not access_token:
            raise ValueError("Gmail API requires access token")
        return send_email_gmail_api(to_email, subject, body, access_token)
    
    elif email_service == "outlook":
        if not access_token:
            raise ValueError("Outlook API requires access_token")
        return send_email_outlook_api(to_email, subject, body, access_token)
    
    elif email_service == "smtp":
        return send_email_smtp(to_email, subject, body, smtp_config=smtp_config)
    
    else:
        raise ValueError(f"Unsupported email service: {email_service}")
