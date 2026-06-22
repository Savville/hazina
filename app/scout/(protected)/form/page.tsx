'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScoutDynamicForm from '@/components/features/ScoutDynamicForm';

export default function ScoutFormPage() {
  const router = useRouter();

  const handleFormSubmit = (data: any) => {
    // In a real application, we would merge this with the map points and photos
    // into a global state (Zustand) or Context before final review.
    console.log('Form data submitted:', data);
    
    // Save to session storage for the final review step
    sessionStorage.setItem('hz_scout_form', JSON.stringify(data));
    
    // Move to the area checklist (Feature 07)
    router.push('/scout/area');
  };

  return (
    <div className="hz-scout-page">
      <header className="hz-scout-header">
        <div className="hz-scout-header-inner">
          <Link href="/scout/photos" className="hz-back-btn">
            ← Back to Photos
          </Link>
          <div className="hz-scout-profile">
            <div className="hz-scout-avatar">S</div>
          </div>
        </div>
      </header>

      <main className="hz-scout-main">
        <p className="hz-scout-instruction">
          Please categorize this property to load the appropriate assessment form. 
          Ensure all visible fields are filled accurately based on your ground observation.
        </p>

        <ScoutDynamicForm onSubmit={handleFormSubmit} />
      </main>
    </div>
  );
}
