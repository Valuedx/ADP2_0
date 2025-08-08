import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/shared/components/Navbar';
import DocumentList from '@/documents/components/DocumentList';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { apiService } from '@/services/apiService';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useDocumentFilter } from '@/shared/hooks/useDocumentFilter';

const UserDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [count, setCount] = useState(0);
  const [total_input_tokens, setTotal_input_tokens] = useState(0);
  const [total_output_tokens, setTotal_output_tokens] = useState(0);
  const [searchDate, setSearchDate] = useState('');
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken
  );
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { documents: dateFilteredDocs, filterDocuments: fetchFilteredDocuments } =
    useDocumentFilter();

  useEffect(() => {
    if (!accessToken) return;

    apiService.listDocuments()
      .then((data) => {
        const { count, documents, total_input_tokens, total_output_tokens } = data;
        setCount(count);
        setTotal_input_tokens(total_input_tokens);
        setTotal_output_tokens(total_output_tokens);
        const docsWithStringId = documents.map((doc) => ({ ...doc, id: String(doc.id) }));
        setDocuments(docsWithStringId);
        setFilteredDocuments(docsWithStringId);
      })
      .catch((error) => {
        handleError(error, 'Failed to fetch documents');
      });
  }, [accessToken, navigate, handleError]);

  const handleSearchDate = (e) => {
    const value = e.target.value;
    setSearchDate(value);
    if (value.trim() && userId) {
      fetchFilteredDocuments(userId, value);
    } else {
      const base = searchName
        ? documents.filter((doc) =>
            doc.filename.toLowerCase().includes(searchName.toLowerCase())
          )
        : documents;
      setFilteredDocuments(base);
      setCurrentPage(1);
    }
  };

  const handleSearchName = (e) => {
    const value = e.target.value;
    setSearchName(value);
    if (!searchDate.trim()) {
      const filtered = value.trim()
        ? documents.filter((doc) =>
            doc.filename.toLowerCase().includes(value.toLowerCase())
          )
        : documents;
      setFilteredDocuments(filtered);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    if (searchDate.trim()) {
      let base = dateFilteredDocs;
      if (searchName.trim()) {
        base = base.filter((doc) =>
          doc.filename.toLowerCase().includes(searchName.toLowerCase())
        );
      }
      setFilteredDocuments(base);
      setCurrentPage(1);
    }
  }, [dateFilteredDocs, searchDate, searchName]);

  const clearFilters = () => {
    setSearchDate('');
    setSearchName('');
    setFilteredDocuments(documents);
    setCurrentPage(1);
  };

  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
    <Navbar />
    <div className="p-6 space-y-8">
        {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => navigate('/uploaddoc')}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <i className="fas fa-upload mr-2"></i>
          Upload
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <h2 className="text-2xl font-bold">{count}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total used input tokens</p>
            <h2 className="text-2xl font-bold">{total_input_tokens}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total used output tokens</p>
            <h2 className="text-2xl font-bold">{total_output_tokens}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Failures</p>
            <h2 className="text-2xl font-bold">0</h2>
          </CardContent>
        </Card>
      </div>

      {/* Search Filters */}
      <div className="flex flex-wrap gap-4 justify-end items-center">
        <input
          type="date"
          value={searchDate}
          onChange={handleSearchDate}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={handleSearchName}
          className="border rounded px-3 py-2"
        />
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>


      {/* Document List */}
      <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
        <h3 className="text-md font-semibold mb-3 text-gray-700">Your Documents</h3>

        <DocumentList documents={currentDocuments} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-5">
            <div className="flex items-center space-x-1 border rounded-md px-3 py-1 shadow-sm bg-white">
              <Button
                variant="ghost"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="text-xs px-2"
              >
                {'<<'}
              </Button>

              {[...Array(totalPages)].map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPage === idx + 1 ? 'default' : 'ghost'}
                  className={`text-xs px-3 py-1 rounded ${
                    currentPage === idx + 1
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => goToPage(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}

              <Button
                variant="ghost"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="text-xs px-2"
              >
                {'>>'}
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default UserDashboard;
