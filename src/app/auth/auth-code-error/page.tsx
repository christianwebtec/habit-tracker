'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass-strong rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Authentication Failed</h2>

                    <p className="text-muted-foreground mb-6">
                        There was an issue processing your sign-in link. This usually happens if:
                    </p>

                    <ul className="text-sm text-muted-foreground text-left space-y-2 mb-8 bg-black/5 p-4 rounded-lg">
                        <li className="flex items-start gap-2">
                            • The link has expired
                        </li>
                        <li className="flex items-start gap-2">
                            • The link was already used
                        </li>
                        <li className="flex items-start gap-2">
                            • You copied the link incorrectly
                        </li>
                    </ul>

                    <Link
                        href="/"
                        className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover-lift transition-smooth"
                    >
                        Return to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
