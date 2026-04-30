import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const [search, setSearch] = useState(keyword);

  useEffect(() => {
    API.get('/products/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category !== 'all') params.set('category', category);
    if (sort) params.set('sort', sort);
    params.set('page', page);
    params.set('limit', 12);
    API.get(`/products?${params}`).then(r => {
      setProducts(r.data.products);
      setTotal(r.data.total);
      setPages(r.data.pages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [keyword, category, sort, page]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    p.set(key, val);
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="page-wrapper products-page">
      <div className="container">
        <div className="products-header">
          <h1 className="page-title products-title">All Products</h1>
          <p className="page-sub products-subtitle">{total} products found</p>
        </div>

        {/* Search + Filters */}
        <div className="products-controls">
          <form className="products-search" onSubmit={e => { e.preventDefault(); setParam('keyword', search); }}>
            <input className="form-input products-search-input"
              placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="btn btn-primary products-search-btn">Search</button>
          </form>
          <select className="form-input" style={{ minWidth: 160 }} value={category} onChange={e => setParam('category', e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input" style={{ minWidth: 160 }} value={sort} onChange={e => setParam('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="products-pills">
          {['all', ...categories].map(c => (
            <button key={c} onClick={() => setParam('category', c)}
              className={`category-pill ${category === c ? 'active' : ''}`}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20 }}>
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`btn ${page === n ? 'btn-primary' : 'btn-outline'} btn-sm`}>{n}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>No products found</h3>
            <p className="products-empty-sub">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
