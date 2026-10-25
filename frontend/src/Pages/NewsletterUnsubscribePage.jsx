import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrum from '../Components/Breadcrum'
import { unsubscribeNewsletterApi } from '../Redux/Sagas/Service'

export default function NewsletterUnsubscribePage() {
    const { _id } = useParams()
    const [status, setStatus] = useState('processing')
    const [message, setMessage] = useState('')

    useEffect(() => {
        (async () => {
            if (!_id) {
                setStatus('error')
                setMessage('Invalid unsubscription link.')
                return
            }
            try {
                const res = await unsubscribeNewsletterApi(_id)
                if (res.result === "Done") {
                    setStatus('success')
                    setMessage('You have been successfully unsubscribed from PizzaHub email promotions.')
                } else {
                    setStatus('error')
                    setMessage(res.reason || 'Failed to process unsubscription.')
                }
            } catch (err) {
                setStatus('error')
                setMessage(err.message || 'Network error while attempting to unsubscribe.')
            }
        })()
    }, [_id])

    return (
        <>
            <Breadcrum title="Newsletter Preferences" />
            <div className="container py-5 my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="card shadow border-0 p-5">
                            {status === 'processing' && (
                                <div>
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <h4>Updating Your Preferences...</h4>
                                    <p className="text-muted">Please wait while we update your subscription settings.</p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div>
                                    <div className="mb-3">
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3.5rem" }}></i>
                                    </div>
                                    <h3 className="fw-bold mb-2">Unsubscribed Successfully</h3>
                                    <p className="text-muted mb-4">{message}</p>
                                    <p className="small text-muted mb-4">We are sad to see you go! You will no longer receive weekly promotional deals, coupons, or offers from us.</p>
                                    <Link to="/" className="btn btn-primary px-4">Return to PizzaHub Home</Link>
                                </div>
                            )}

                            {status === 'error' && (
                                <div>
                                    <div className="mb-3">
                                        <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: "3.5rem" }}></i>
                                    </div>
                                    <h3 className="fw-bold mb-2">Unsubscription Notice</h3>
                                    <p className="text-muted mb-4">{message}</p>
                                    <Link to="/" className="btn btn-outline-primary px-4">Return to Home</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
