from app.schemas.lead import LeadCreate

class LeadScoringService:
    def calculate_score(self, lead: LeadCreate) -> float:
        score = 10.0  # Base score

        if lead.email:
            score += 10.0
        
        if lead.phone:
            score += 10.0
        
        if lead.company_name:
            score += 5.0
        
        if lead.source:
            if lead.source.lower() == "referral":
                score += 20.0
            elif lead.source.lower() == "website":
                score += 5.0
            elif lead.source.lower() == "linkedin":
                score += 15.0
        
        # Normalize to 0-100 probability
        probability = min(score, 100.0) / 100.0
        return probability

lead_scoring_service = LeadScoringService()
