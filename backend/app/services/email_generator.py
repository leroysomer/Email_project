
from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_personalized_email(
    user_template: str,
    user_interests: str,
    academic_name: str,
    academic_research_interests: str,
    academic_bio: str = None
) -> str:
    """
    Generate a personalized email using OpenAI GPT-4.
    """

    prompt = f"""You are helping a student write a personalized email to an academic researcher for an internship opportunity.

Student's email template:
{user_template}

Student's interests/research areas:
{user_interests}

Recipient information:
- Name: {academic_name}
- Research interests: {academic_research_interests}
{f"- Bio: {academic_bio}" if academic_bio else ""}

Please generate a personalized email that:
1. Uses the student's template as a base structure
2. Personalizes it with the recipient's name
3. Highlights the alignment between the student's interests and the researcher's work
4. Maintains a professional, respectful tone
5. Keeps it concise (2-3 paragraphs)

Generate only the email body, starting with a greeting and ending with a closing."""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional email writing assistant for academic internship applications."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        generated_email = response.choices[0].message.content
        return generated_email

    except Exception:
        # Fallback to a simple template if API fails
        return f"""Dear Dr. {academic_name},

I am writing to express my interest in potential internship opportunities in your research group focusing on {academic_research_interests}.

{user_template}

I am particularly interested in {user_interests}, and I believe my interests align well with your research.

Thank you for your consideration.

Best regards"""
