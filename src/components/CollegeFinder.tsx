'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { College, Category, Gender, SearchFilters, CollegeResult } from '@/types/college';
import { searchColleges, getFeeRange } from '@/lib/college-utils';
import { Search, Users, MapPin, IndianRupee, GraduationCap, AlertCircle, Filter, Download } from 'lucide-react';

export default function CollegeFinder() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    rank: 0,
    category: 'OC',
    gender: 'BOYS'
  });

  // Load college data
  useEffect(() => {
    const loadColleges = async () => {
      try {
        setError(null);
        const response = await fetch('/Colleges.json');
        if (!response.ok) {
          throw new Error('Failed to load college data');
        }
        const data = await response.json();
        setColleges(data);
      } catch (error) {
        console.error('Error loading college data:', error);
        setError('Failed to load college data. Please refresh the page.');
      } finally {
        setDataLoading(false);
      }
    };
    
    loadColleges();
  }, []);

  // Search for colleges
  const handleSearch = () => {
    if (filters.rank <= 0) {
      setError('Please enter a valid rank (greater than 0)');
      return;
    }

    if (filters.rank > 200000) {
      setError('Rank seems too high. Please check your rank.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = searchColleges(colleges, filters);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('No colleges found matching your criteria. Try adjusting your filters.');
      }
    } catch (error) {
      console.error('Error searching colleges:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get statistics for display
  const stats = useMemo(() => {
    if (results.length === 0) return null;
    
    const eligible = results.filter(r => r.eligible).length;
    const notEligible = results.length - eligible;
    const validFees = results
      .map(r => r.college["COLLFE E"])
      .filter((fee): fee is number => fee !== null && fee > 0);
    const avgFee = validFees.length > 0 ? validFees.reduce((sum, fee) => sum + fee, 0) / validFees.length : 0;
    
    return {
      total: results.length,
      eligible,
      notEligible,
      avgFee: Math.round(avgFee)
    };
  }, [results]);

  // Export results as CSV
  const exportToCSV = () => {
    if (results.length === 0) return;
    
    const csvContent = [
      ['College Name', 'Code', 'Location', 'Cutoff Rank', 'Fee', 'Type', 'Status'].join(','),
      ...results.map(result => [
        `"${result.college["NAME OF THE INSTITUTION"]}"`,
        result.college.INSTCODE,
        result.college.PLACE,
        result.cutoffRank || 'N/A',
        result.college["COLLFE E"] || 'N/A',
        result.college.COED,
        result.eligible ? 'Eligible' : 'Not Eligible'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eamcet-colleges-rank-${filters.rank}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get fee range for display
  const feeRange = colleges.length > 0 ? getFeeRange(colleges) : { min: 0, max: 0 };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg">Loading college data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold text-blue-900 flex items-center justify-center gap-2">
              <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
              EAMCET College Predictor
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Find engineering colleges based on your EAMCET rank and category
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Criteria
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rank">Your EAMCET Rank *</Label>
                <Input
                  id="rank"
                  type="number"
                  placeholder="Enter your rank"
                  value={filters.rank || ''}
                  onChange={(e) => {
                    setError(null);
                    setFilters(prev => ({ ...prev, rank: parseInt(e.target.value) || 0 }));
                  }}
                  min="1"
                  max="200000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={filters.category} onValueChange={(value: Category) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OC">OC (Open Category)</SelectItem>
                    <SelectItem value="SC">SC (Scheduled Caste)</SelectItem>
                    <SelectItem value="ST">ST (Scheduled Tribe)</SelectItem>
                    <SelectItem value="BCA">BC-A</SelectItem>
                    <SelectItem value="BCB">BC-B</SelectItem>
                    <SelectItem value="BCC">BC-C</SelectItem>
                    <SelectItem value="BCD">BC-D</SelectItem>
                    <SelectItem value="BCE">BC-E</SelectItem>
                    <SelectItem value="OC_EWS">OC-EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={filters.gender} onValueChange={(value: Gender) => setFilters(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOYS">Boys</SelectItem>
                    <SelectItem value="GIRLS">Girls</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showFilters && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="maxFee">Maximum Fee (Optional)</Label>
                    <Input
                      id="maxFee"
                      type="number"
                      placeholder={`Max: ₹${feeRange.max.toLocaleString()}`}
                      value={filters.maxFee || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxFee: parseInt(e.target.value) || undefined }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coed">College Type (Optional)</Label>
                    <Select value={filters.coed || 'ALL'} onValueChange={(value) => setFilters(prev => ({ ...prev, coed: value === 'ALL' ? undefined : value as 'COED' | 'BOYS' | 'GIRLS' }))}>
                      <SelectTrigger id="coed">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="COED">Co-Education</SelectItem>
                        <SelectItem value="BOYS">Boys Only</SelectItem>
                        <SelectItem value="GIRLS">Girls Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSearch} 
                disabled={loading || filters.rank <= 0}
                className="flex-1 sm:flex-initial"
              >
                {loading ? 'Searching...' : 'Find Colleges'}
              </Button>
              
              {results.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={exportToCSV}
                  className="flex-1 sm:flex-initial"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Colleges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.eligible}</div>
                <div className="text-sm text-gray-600">Eligible</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.notEligible}</div>
                <div className="text-sm text-gray-600">Not Eligible</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">₹{stats.avgFee.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg Fee</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Search Results ({results.length} colleges found)
              </CardTitle>
              <CardDescription>
                Colleges are sorted by eligibility and cutoff ranks. Green rows indicate you&apos;re eligible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">College Name</TableHead>
                      <TableHead>
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location
                      </TableHead>
                      <TableHead>Cutoff Rank</TableHead>
                      <TableHead>
                        <IndianRupee className="h-4 w-4 inline mr-1" />
                        Fee
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow 
                        key={index} 
                        className={result.eligible ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold text-sm leading-tight">
                              {result.college["NAME OF THE INSTITUTION"]}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Code: {result.college.INSTCODE} | Est: {result.college.ESTD}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{result.college.PLACE}</TableCell>
                        <TableCell className="text-sm font-mono">
                          {result.cutoffRank ? result.cutoffRank.toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {result.college["COLLFE E"] ? `₹${result.college["COLLFE E"].toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {result.college.COED}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={result.eligible ? "default" : "destructive"}
                            className={`text-xs ${result.eligible ? "bg-green-600" : "bg-red-600"}`}
                          >
                            {result.eligible ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card>
          <CardContent className="text-center p-4">
            <p className="text-sm text-gray-600">
              This tool is for guidance only. Please verify cutoffs with official EAMCET counseling results before making final decisions.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Data based on previous year&apos;s cutoff trends. Actual cutoffs may vary.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}