import { Check } from "lucide-react";

export const DoneStep = () => {
    return (
        <div style={{ width: 20, height: 20, background: '#2D5988', boxShadow: '0px 36px 60px -20px rgba(0, 46, 94, 0.25)', borderRadius: 20, border: '1px rgba(255, 255, 255, 0.50) solid', justifyContent: 'center', alignItems: 'center', display: 'inline-flex' }}>
            <Check color="#ffffff" size={12} />
        </div>
    );
}