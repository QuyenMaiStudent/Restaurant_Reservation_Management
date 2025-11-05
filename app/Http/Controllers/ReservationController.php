<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(): Response
    {
        $reservations = Reservation::orderBy('reserved_at')->get();
        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Reservations/Form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:100',
            'phone' => ['required', 'regex:/^\\+?\\d{8,15}$/'],
            'party_size' => 'required|integer|min:1|max:50',
            'reserved_at' => 'required|date|after_or_equal:now',
            'status' => 'nullable|in:pending,confirmed,seated,canceled',
        ]);

        $data['status'] = $data['status'] ?? 'pending';

        Reservation::create($data);

        return redirect()->route('reservations.index')->with('success', 'Reservation created.');
    }

    public function edit(Reservation $reservation): Response
    {
        return Inertia::render('Reservations/Form', [
            'reservation' => $reservation,
        ]);
    }

    public function update(Request $request, Reservation $reservation): RedirectResponse
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:100',
            'phone' => ['required', 'regex:/^\\+?\\d{8,15}$/'],
            'party_size' => 'required|integer|min:1|max:50',
            'reserved_at' => 'required|date|after_or_equal:now',
            'status' => 'nullable|in:pending,confirmed,seated,canceled',
        ]);

        $reservation->update($data);

        return redirect()->route('reservations.index')->with('success', 'Reservation updated.');
    }

    public function destroy(Reservation $reservation): RedirectResponse
    {
        $reservation->delete();

        return redirect()->route('reservations.index')->with('success', 'Reservation deleted.');
    }
}
