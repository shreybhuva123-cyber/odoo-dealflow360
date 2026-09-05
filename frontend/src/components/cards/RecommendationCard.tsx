import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Recommendation } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply?: (rec: Recommendation) => void;
}

export function RecommendationCard({ recommendation, onApply }: RecommendationCardProps) {
  return (
    <Card className="border-blue-500/30 bg-blue-950/10 hover:border-blue-500/50 transition-all">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <Badge variant="info" size="sm" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {recommendation.type}
        </Badge>
        <span className="text-[11px] font-semibold text-emerald-400 font-mono">
          +{formatCurrency(recommendation.potentialRevenueIncrease)}
        </span>
      </CardHeader>
      <CardContent className="space-y-1.5 pb-3">
        <CardTitle className="text-sm font-semibold">{recommendation.title}</CardTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">{recommendation.description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={() => onApply?.(recommendation)}
          variant="default"
          size="sm"
          className="w-full text-xs"
        >
          Apply Recommendation
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
