import requests
from bs4 import BeautifulSoup
import time
from typing import List, Dict
import re

def search_google_scholar(university: str, research_domain: str, max_results: int = 10) -> List[Dict]:
    """
    Search Google Scholar for academics based on university and research domain.
    Note: This is a basic implementation. Google Scholar may block requests.
    For production, consider using official APIs or scraping services.
    """
    results = []
    
    # Construct search query
    query = f"{research_domain} site:edu {university}"
    url = f"https://scholar.google.com/scholar?q={query}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract author information from search results
        # This is a simplified parser - Google Scholar structure may vary
        for result in soup.find_all('div', class_='gs_ri')[:max_results]:
            try:
                # Extract name from title/link
                title_elem = result.find('h3', class_='gs_rt')
                if not title_elem:
                    continue
                
                # Extract author info (name and affiliation)
                author_info = result.find('div', class_='gs_a')
                if author_info:
                    author_text = author_info.get_text()
                    # Parse author name and affiliation
                    parts = author_text.split('-')
                    name = parts[0].strip() if parts else "Unknown"
                    affiliation = parts[1].strip() if len(parts) > 1 else university
                else:
                    name = "Unknown"
                    affiliation = university
                
                # Extract research interests from snippet
                snippet_elem = result.find('div', class_='gs_rs')
                research_interests = snippet_elem.get_text() if snippet_elem else ""
                
                # Try to find email (not always available)
                email = None
                # Email extraction would require visiting individual profile pages
                
                # Try to find profile URL
                link_elem = result.find('h3', class_='gs_rt').find('a') if title_elem else None
                profile_url = link_elem.get('href') if link_elem else None
                
                results.append({
                    'name': name,
                    'email': email,
                    'university': affiliation,
                    'research_interests': research_interests,
                    'bio': research_interests,
                    'profile_url': profile_url
                })
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                print(f"Error parsing result: {e}")
                continue
    
    except requests.RequestException as e:
        print(f"Error searching Google Scholar: {e}")
        # Return mock data for development
        return get_mock_academics(university, research_domain)
    
    # If no results, return mock data
    if not results:
        return get_mock_academics(university, research_domain)
    
    return results

def get_mock_academics(university: str, research_domain: str) -> List[Dict]:
    """Return mock academic data for development/testing"""
    return [
        {
            'name': f'Dr. John Smith',
            'email': f'john.smith@{university.lower().replace(" ", "")}.edu',
            'university': university,
            'research_interests': f'{research_domain}, Machine Learning, Data Science',
            'bio': f'Researching {research_domain} at {university}',
            'profile_url': None
        },
        {
            'name': f'Prof. Jane Doe',
            'email': f'jane.doe@{university.lower().replace(" ", "")}.edu',
            'university': university,
            'research_interests': f'{research_domain}, Artificial Intelligence',
            'bio': f'Professor specializing in {research_domain}',
            'profile_url': None
        }
    ]

def extract_email_from_text(text: str) -> str:
    """Extract email address from text using regex"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else None
